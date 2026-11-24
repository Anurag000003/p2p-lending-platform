const {
  User,
  Loan,
  FundingCampaign,
  KYCApplication,
  PaymentTransaction,
  AuditLog,
  Dispute,
  LedgerEntry
} = require('../models');

class AdminController {
  /**
   * Admin Platform Overview Statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalLoans,
        activeLoans,
        totalCampaigns,
        pendingKYCs,
        openDisputes,
        recentLoans
      ] = await Promise.all([
        User.countDocuments(),
        Loan.countDocuments(),
        Loan.countDocuments({ status: { $in: ['open_for_funding', 'fully_funded', 'disbursed', 'active_repaying'] } }),
        FundingCampaign.countDocuments(),
        KYCApplication.countDocuments({ status: 'pending' }),
        Dispute.countDocuments({ status: 'open' }),
        Loan.find().sort({ createdAt: -1 }).limit(5).populate('borrowerId', 'name email')
      ]);

      const volumeAgg = await Loan.aggregate([
        { $match: { status: { $in: ['disbursed', 'active_repaying', 'completed'] } } },
        { $group: { _id: null, totalVolume: { $sum: '$amount' }, totalRepaid: { $sum: '$totalRepaidAmount' } } }
      ]);

      const volume = volumeAgg[0] || { totalVolume: 0, totalRepaid: 0 };

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalLoans,
          activeLoans,
          totalCampaigns,
          pendingKYCs,
          openDisputes,
          totalVolumeDisbursed: volume.totalVolume,
          totalRepaid: volume.totalRepaid
        },
        recentLoans
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * User Management: List, Search, Filter & Suspend
   */
  static async getAllUsers(req, res) {
    try {
      const { search, role, kycStatus, page = 1, limit = 50 } = req.query;

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role && role !== 'all') query.roles = role;
      if (kycStatus && kycStatus !== 'all') query.kycStatus = kycStatus;

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await User.countDocuments(query);

      return res.json({ success: true, users, total });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
      return res.json({ success: true, message: `User status updated to ${status}`, user });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * KYC Verification Reviews
   */
  static async getPendingKYCs(req, res) {
    try {
      const kycs = await KYCApplication.find({ status: 'pending' })
        .populate('userId', 'name email phone createdAt')
        .sort({ createdAt: 1 });

      return res.json({ success: true, kycs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async reviewKYC(req, res) {
    try {
      const { kycId } = req.params;
      const { decision, rejectionReason } = req.body; // 'approved' or 'rejected'

      const kyc = await KYCApplication.findById(kycId);
      if (!kyc) return res.status(404).json({ success: false, message: 'KYC not found' });

      kyc.status = decision;
      kyc.reviewedBy = req.user._id;
      kyc.reviewedAt = new Date();
      if (decision === 'rejected') kyc.rejectionReason = rejectionReason;
      await kyc.save();

      await User.findByIdAndUpdate(kyc.userId, {
        kycStatus: decision === 'approved' ? 'verified' : 'rejected'
      });

      return res.json({ success: true, message: `KYC application marked as ${decision}`, kyc });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Audit Logs
   */
  static async getAuditLogs(req, res) {
    try {
      const logs = await AuditLog.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(100);

      return res.json({ success: true, logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = AdminController;
