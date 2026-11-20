const mongoose = require('mongoose');
const AuditLog = require('./AuditLog');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  joinDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Expired' }
}, { timestamps: true });

// ===== TRIGGER: log when a new member is created =====
memberSchema.post('save', async function (doc) {
  if (doc.createdAt && doc.createdAt.getTime() === doc.updatedAt.getTime()) {
    await AuditLog.create({
      action: 'MEMBER_CREATED',
      collectionName: 'members',
      documentId: doc._id,
      details: `New member added: ${doc.name}`
    });
  }
});

// ===== TRIGGER: log when a member is updated =====
memberSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await AuditLog.create({
      action: 'MEMBER_UPDATED',
      collectionName: 'members',
      documentId: doc._id,
      details: `Member updated: ${doc.name}`
    });
  }
});

// ===== TRIGGER: log when a member is deleted =====
memberSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await AuditLog.create({
      action: 'MEMBER_DELETED',
      collectionName: 'members',
      documentId: doc._id,
      details: `Member deleted: ${doc.name}`
    });
  }
});

module.exports = mongoose.model('Member', memberSchema);