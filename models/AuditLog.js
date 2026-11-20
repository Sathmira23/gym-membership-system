const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },      // e.g. MEMBER_CREATED, PAYMENT_CREATED
  collectionName: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);