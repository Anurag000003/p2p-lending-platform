const { v4: uuidv4 } = require('uuid');
const {
  FundingGroup,
  GroupMember,
  FundingCampaign,
  CampaignContribution,
  Notification,
  User
} = require('../models');
const CalculationEngine = require('../services/calculationEngine');
const PaymentService = require('../integrations/paymentService');
const { createFundingGroupSchema, contributeCampaignSchema } = require('../validators/schemas');

class GroupFundingController {
  /**
   * Create a new funding group & linked campaign
   */
  static async createGroup(req, res) {
    try {
      const validated = createFundingGroupSchema.parse(req.body);

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (validated.durationDays || 30));

      const groupReference = `GRP-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

      const group = new FundingGroup({
        groupReference,
        title: validated.title,
        description: validated.description,
        organizerId: req.user._id,
        groupModel: validated.groupModel,
        category: validated.category,
        targetAmount: validated.targetAmount,
        collectedAmount: 0,
        remainingAmount: validated.targetAmount,
        deadline,
        status: 'active', // active for instant review in demo
        privacy: validated.privacy,
        inviteCode: uuidv4().substring(0, 8).toUpperCase(),
        financialCategory: validated.financialCategory,
        interestRateAnnual: validated.interestRateAnnual,
        durationMonths: validated.durationMonths
      });

      await group.save();

      // Organizer is primary group member
      await GroupMember.create({
        groupId: group._id,
        userId: req.user._id,
        roleInGroup: 'organizer',
        status: 'active'
      });

      // Create linked funding campaign
      let modelType = 'model_a';
      if (validated.groupModel === 'model_b_group_borrowing') modelType = 'model_b';
      else if (validated.groupModel === 'model_c_community_funding') modelType = 'model_c';

      let fundingNature = 'loan';
      if (validated.financialCategory === 'donation_based') fundingNature = 'donation';
      else if (validated.financialCategory === 'investment_based') fundingNature = 'investment';

      const campaign = new FundingCampaign({
        campaignReference: `CMP-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        groupId: group._id,
        organizerId: req.user._id,
        title: validated.title,
        description: validated.description,
        modelType,
        fundingNature,
        targetAmount: validated.targetAmount,
        confirmedAmount: 0,
        remainingAmount: validated.targetAmount,
        deadline,
        status: 'active'
      });

      await campaign.save();

      return res.status(201).json({
        success: true,
        message: 'Funding group and campaign published successfully',
        group,
        campaign
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Browse all active group campaigns
   */
  static async browseCampaigns(req, res) {
    try {
      const { category, modelType, fundingNature, search } = req.query;

      const query = { status: { $in: ['active', 'goal_reached'] } };
      if (modelType && modelType !== 'all') query.modelType = modelType;
      if (fundingNature && fundingNature !== 'all') query.fundingNature = fundingNature;
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const campaigns = await FundingCampaign.find(query)
        .populate('organizerId', 'name kycStatus')
        .populate('groupId', 'category financialCategory groupModel inviteCode')
        .sort({ createdAt: -1 });

      const mapped = campaigns.map(c => {
        const progressPercent = CalculationEngine.calculateFundingProgress(c.confirmedAmount, c.targetAmount);
        return {
          ...c.toObject(),
          progressPercent
        };
      });

      return res.json({ success: true, campaigns: mapped });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get campaign details by ID
   */
  static async getCampaignById(req, res) {
    try {
      const campaign = await FundingCampaign.findById(req.params.id)
        .populate('organizerId', 'name email kycStatus')
        .populate('groupId');

      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const contributions = await CampaignContribution.find({ campaignId: campaign._id })
        .populate('contributorId', 'name')
        .sort({ createdAt: -1 });

      const members = await GroupMember.find({ groupId: campaign.groupId._id })
        .populate('userId', 'name email');

      const progressPercent = CalculationEngine.calculateFundingProgress(campaign.confirmedAmount, campaign.targetAmount);

      return res.json({
        success: true,
        campaign: {
          ...campaign.toObject(),
          progressPercent
        },
        contributions,
        members
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Contribute funds to a campaign (Donation, Loan contribution, or Investment)
   */
  static async contributeToCampaign(req, res) {
    try {
      const validated = contributeCampaignSchema.parse(req.body);

      const campaign = await FundingCampaign.findById(validated.campaignId);
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      if (campaign.status !== 'active') {
        return res.status(400).json({ success: false, message: `Campaign is not accepting funds (Status: ${campaign.status})` });
      }

      if (validated.amount > campaign.remainingAmount) {
        return res.status(400).json({
          success: false,
          message: `Contribution ₹${validated.amount} exceeds remaining goal of ₹${campaign.remainingAmount}`
        });
      }

      // Process payment authorization
      const paymentTxn = await PaymentService.initiateTransaction({
        userId: req.user._id,
        amount: validated.amount,
        type: 'group_contribution',
        relatedEntityId: campaign._id,
        relatedEntityType: 'FundingCampaign',
        metadata: { campaignTitle: campaign.title, contributionType: validated.contributionType }
      });

      await PaymentService.verifyAndCompleteTransaction(paymentTxn.transactionReference, true);

      // Create campaign contribution
      const contribution = new CampaignContribution({
        contributionReference: `CCON-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
        campaignId: campaign._id,
        groupId: campaign.groupId,
        contributorId: req.user._id,
        amount: validated.amount,
        contributionType: validated.contributionType,
        isAnonymous: validated.isAnonymous,
        status: 'confirmed',
        paymentTransactionId: paymentTxn._id
      });

      await contribution.save();

      // Update campaign amounts atomically
      campaign.confirmedAmount = Math.round((campaign.confirmedAmount + validated.amount) * 100) / 100;
      campaign.remainingAmount = Math.max(0, Math.round((campaign.targetAmount - campaign.confirmedAmount) * 100) / 100);
      campaign.contributorCount += 1;

      if (campaign.remainingAmount <= 0) {
        campaign.status = 'goal_reached';
      }

      await campaign.save();

      // Update linked group
      await FundingGroup.findByIdAndUpdate(campaign.groupId, {
        $inc: { collectedAmount: validated.amount },
        $set: { remainingAmount: campaign.remainingAmount, status: campaign.status === 'goal_reached' ? 'funded' : 'active' }
      });

      // Notify organizer
      await Notification.create({
        recipientId: campaign.organizerId,
        title: 'New Campaign Contribution Received',
        message: `₹${validated.amount.toLocaleString()} was contributed to "${campaign.title}" by ${validated.isAnonymous ? 'an anonymous backer' : req.user.name}.`,
        type: 'funding_received',
        relatedEntityId: campaign._id
      });

      return res.status(201).json({
        success: true,
        message: 'Contribution recorded successfully',
        contribution,
        campaign: {
          confirmedAmount: campaign.confirmedAmount,
          remainingAmount: campaign.remainingAmount,
          status: campaign.status,
          progressPercent: CalculationEngine.calculateFundingProgress(campaign.confirmedAmount, campaign.targetAmount)
        }
      });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ success: false, errors: err.errors.map(e => e.message) });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Join a group using invite code (for Model B group borrowing or private groups)
   */
  static async joinGroupWithCode(req, res) {
    try {
      const { inviteCode, requestedAmount = 0 } = req.body;
      const group = await FundingGroup.findOne({ inviteCode: inviteCode.trim().toUpperCase() });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Invalid group invitation code' });
      }

      const existingMember = await GroupMember.findOne({ groupId: group._id, userId: req.user._id });
      if (existingMember) {
        return res.status(400).json({ success: false, message: 'You are already a participant in this group' });
      }

      const member = new GroupMember({
        groupId: group._id,
        userId: req.user._id,
        roleInGroup: 'borrower_participant',
        requestedAllocationAmount: requestedAmount,
        status: 'active'
      });

      await member.save();

      return res.json({
        success: true,
        message: `Successfully joined "${group.title}"`,
        group,
        member
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = GroupFundingController;
