const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeReference: { type: String, required: true, unique: true, index: true },
  raisedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  againstUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundingCampaign' },
  reason: { type: String, required: true },
  details: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'under_investigation', 'resolved', 'dismissed'],
    default: 'open',
    index: true
  },
  assignedAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
