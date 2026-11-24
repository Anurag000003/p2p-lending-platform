const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  transactionReference: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  relatedEntityType: {
    type: String,
    enum: ['Loan', 'LendingContribution', 'FundingCampaign', 'CampaignContribution', 'Repayment', 'Wallet']
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'loan_funding', 'loan_disbursement', 'repayment_payment', 'lender_payout', 'group_contribution', 'refund'],
    required: true,
    index: true
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['initiated', 'authorized', 'captured', 'settled', 'failed', 'refunded'],
    default: 'initiated',
    index: true
  },
  gateway: {
    type: String,
    enum: ['razorpay_simulated', 'bank_simulator', 'platform_wallet', 'internal_ledger'],
    default: 'razorpay_simulated'
  },
  gatewayPaymentId: { type: String },
  gatewayOrderId: { type: String },
  gatewaySignature: { type: String },
  verifiedServerSide: { type: Boolean, default: false },
  failureReason: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
