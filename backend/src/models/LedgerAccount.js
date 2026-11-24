const mongoose = require('mongoose');

const ledgerAccountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true, unique: true, index: true },
  accountType: {
    type: String,
    enum: ['user_wallet', 'escrow_holding', 'platform_fee', 'lender_receivable', 'borrower_payable', 'group_campaign_escrow'],
    required: true,
    index: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  currency: { type: String, default: 'INR' },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'frozen', 'closed'], default: 'active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('LedgerAccount', ledgerAccountSchema);
