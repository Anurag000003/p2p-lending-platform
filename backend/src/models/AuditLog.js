const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
