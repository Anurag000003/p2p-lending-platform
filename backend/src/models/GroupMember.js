const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FundingGroup', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roleInGroup: {
    type: String,
    enum: ['organizer', 'borrower_participant', 'contributor', 'observer'],
    default: 'borrower_participant'
  },
  requestedAllocationAmount: { type: Number, default: 0 },
  allocatedAmount: { type: Number, default: 0 },
  repaymentObligation: { type: Number, default: 0 },
  repaidAmount: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['invited', 'active', 'pending_consent', 'completed', 'removed'],
    default: 'active'
  }
}, {
  timestamps: true
});

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GroupMember', groupMemberSchema);
