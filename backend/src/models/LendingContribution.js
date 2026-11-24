const mongoose = require('mongoose');

const lendingContributionSchema = new mongoose.Schema({
  contributionReference: { type: String, required: true, unique: true, index: true },
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  amount: { type: Number, required: true, min: 100 },
  sharePercentage: { type: Number, required: true, min: 0, max: 100 },
  fundingOption: {
    type: String,
    enum: ['full_funding', 'partial_funding'],
    default: 'partial_funding'
  },
  status: {
    type: String,
    enum: ['confirmed', 'disbursed', 'active_earning', 'repaid_in_full', 'defaulted', 'refunded'],
    default: 'confirmed',
    index: true
  },
  expectedPrincipalReturn: { type: Number, required: true },
  expectedInterestReturn: { type: Number, required: true },
  principalRecovered: { type: Number, default: 0 },
  interestReceived: { type: Number, default: 0 },
  paymentTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction' }
}, {
  timestamps: true
});

module.exports = mongoose.model('LendingContribution', lendingContributionSchema);
