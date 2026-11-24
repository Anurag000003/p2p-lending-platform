const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['loan_update', 'funding_received', 'repayment_reminder', 'kyc_status', 'group_invite', 'disbursement', 'system_alert'],
    required: true
  },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  relatedEntityType: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
