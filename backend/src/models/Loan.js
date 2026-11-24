const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanReference: { type: String, required: true, unique: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1000 },
  fundedAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  purpose: {
    type: String,
    enum: ['education', 'business', 'medical', 'personal', 'home_improvement', 'debt_consolidation', 'other'],
    required: true
  },
  description: { type: String, required: true },
  durationMonths: { type: Number, required: true, min: 1, max: 60 },
  interestRateAnnual: { type: Number, required: true, min: 1, max: 36 },
  repaymentFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'one_time'],
    default: 'monthly'
  },
  fundingType: {
    type: String,
    enum: ['individual', 'group_shared', 'community'],
    default: 'individual'
  },
  fundingDeadline: { type: Date, required: true },
  status: {
    type: String,
    enum: [
      'pending_approval',
      'approved',
      'open_for_funding',
      'fully_funded',
      'disbursed',
      'active_repaying',
      'completed',
      'overdue',
      'defaulted',
      'rejected',
      'cancelled'
    ],
    default: 'pending_approval',
    index: true
  },
  supportingDocs: [{
    docType: { type: String },
    url: { type: String }
  }],
  riskGrade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'],
    default: 'B'
  },
  disbursedAt: { type: Date },
  totalRepaidAmount: { type: Number, default: 0 },
  outstandingPrincipal: { type: Number, default: 0 },
  totalInterestPayable: { type: Number, default: 0 },
  totalInterestRepaid: { type: Number, default: 0 },
  approvalNotes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
