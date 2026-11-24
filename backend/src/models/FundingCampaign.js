const mongoose = require('mongoose');

const fundingCampaignSchema = new mongoose.Schema({
  campaignReference: { type: String, required: true, unique: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundingGroup', required: true, index: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  modelType: {
    type: String,
    enum: ['model_a', 'model_b', 'model_c'],
    required: true
  },
  fundingNature: {
    type: String,
    enum: ['donation', 'loan', 'investment'],
    required: true
  },
  targetAmount: { type: Number, required: true, min: 1000 },
  confirmedAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  contributorCount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending_review', 'active', 'goal_reached', 'disbursed', 'completed', 'closed_refunded', 'rejected'],
    default: 'pending_review',
    index: true
  },
  beneficiaryDetails: {
    name: { type: String },
    bankAccount: { type: String },
    verificationProofUrl: { type: String }
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('FundingCampaign', fundingCampaignSchema);
