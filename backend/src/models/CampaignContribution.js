const mongoose = require('mongoose');

const campaignContributionSchema = new mongoose.Schema({
  contributionReference: { type: String, required: true, unique: true, index: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundingCampaign', required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundingGroup', required: true, index: true },
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 50 },
  contributionType: {
    type: String,
    enum: ['donation', 'loan_contribution', 'investment_pledge'],
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'allocated', 'disbursed', 'repaid', 'refunded'],
    default: 'confirmed',
    index: true
  },
  isAnonymous: { type: Boolean, default: false },
  expectedRepaymentPrincipal: { type: Number, default: 0 },
  expectedRepaymentInterest: { type: Number, default: 0 },
  actualRepaidPrincipal: { type: Number, default: 0 },
  actualRepaidInterest: { type: Number, default: 0 },
  paymentTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CampaignContribution', campaignContributionSchema);
