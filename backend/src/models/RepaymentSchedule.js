const mongoose = require('mongoose');

const repaymentScheduleSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  installmentNumber: { type: Number, required: true },
  dueDate: { type: Date, required: true, index: true },
  principalAmount: { type: Number, required: true },
  interestAmount: { type: Number, required: true },
  totalInstallmentAmount: { type: Number, required: true },
  remainingLoanBalance: { type: Number, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'paid', 'partially_paid', 'overdue', 'defaulted'],
    default: 'upcoming',
    index: true
  },
  paidAmount: { type: Number, default: 0 },
  paidDate: { type: Date },
  penaltyAmount: { type: Number, default: 0 }
}, {
  timestamps: true
});

repaymentScheduleSchema.index({ loanId: 1, installmentNumber: 1 }, { unique: true });

module.exports = mongoose.model('RepaymentSchedule', repaymentScheduleSchema);
