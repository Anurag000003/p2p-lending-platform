const mongoose = require('mongoose');

const fundingGroupSchema = new mongoose.Schema({
  groupReference: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  groupModel: {
    type: String,
    enum: ['model_a_one_borrower', 'model_b_group_borrowing', 'model_c_community_funding'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['education', 'small_business', 'emergency_relief', 'community_project', 'agriculture', 'healthcare', 'other'],
    required: true
  },
  targetAmount: { type: Number, required: true, min: 1000 },
  collectedAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'active', 'funded', 'disbursed', 'completed', 'cancelled', 'refunded'],
    default: 'pending_approval',
    index: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private_invite_only'],
    default: 'public'
  },
  inviteCode: { type: String, unique: true, sparse: true },
  maxMembers: { type: Number, default: 50 },
  interestRateAnnual: { type: Number, default: 0 },
  durationMonths: { type: Number, default: 12 },
  financialCategory: {
    type: String,
    enum: ['donation_based', 'loan_based', 'investment_based'],
    default: 'loan_based'
  },
  disbursementApproved: { type: Boolean, default: false },
  disbursedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('FundingGroup', fundingGroupSchema);
