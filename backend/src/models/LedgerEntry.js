const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  entryReference: { type: String, required: true, unique: true, index: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction', index: true },
  debitAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'LedgerAccount', required: true, index: true },
  creditAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'LedgerAccount', required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'INR' },
  narrative: { type: String, required: true },
  entryType: {
    type: String,
    enum: ['loan_funding', 'disbursement', 'repayment_principal', 'repayment_interest', 'fee_deduction', 'wallet_topup', 'wallet_withdrawal', 'campaign_contribution', 'refund'],
    required: true
  },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
