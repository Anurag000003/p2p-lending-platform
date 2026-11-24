const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  repaymentReference: { type: String, required: true, unique: true, index: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'RepaymentSchedule', required: true, index: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amountPaid: { type: Number, required: true, min: 1 },
  principalPortion: { type: Number, required: true },
  interestPortion: { type: Number, required: true },
  penaltyPortion: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['simulated_gateway', 'bank_transfer', 'wallet', 'razorpay'],
    default: 'simulated_gateway'
  },
  paymentTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' },
  lenderDistributions: [{
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contributionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LendingContribution' },
    principalAmount: { type: Number },
    interestAmount: { type: Number },
    totalDistributed: { type: Number },
    transferredAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'refunded'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Repayment', repaymentSchema);
