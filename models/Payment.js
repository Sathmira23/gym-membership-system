const mongoose = require('mongoose');
const Member = require('./Member');
const Plan = require('./Plan');
const AuditLog = require('./AuditLog');

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  amount: { type: Number },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// ===== TRIGGER (BEFORE INSERT equivalent) =====
// Runs before a payment is saved.
// Automatically sets the payment amount from the selected plan's price.
paymentSchema.pre('save', async function () {
  const plan = await Plan.findById(this.plan);
  if (!plan) throw new Error('Plan not found');
  this.amount = plan.price;
});

// ===== TRIGGER (AFTER INSERT equivalent) =====
// Runs after a payment is saved.
// Extends the member's expiry date and sets the status to Active.
paymentSchema.post('save', async function (doc) {
  const plan = await Plan.findById(doc.plan);
  const member = await Member.findById(doc.member);

  // If the membership is still active, extend from the current expiry date.
  // Otherwise, start counting from today.
  let startDate = new Date();
  if (member.expiryDate && member.expiryDate > startDate) {
    startDate = new Date(member.expiryDate);
  }

  startDate.setMonth(startDate.getMonth() + plan.durationMonths);

  member.expiryDate = startDate;
  member.plan = plan._id;
  member.status = 'Active';
  await member.save();
});

// ===== TRIGGER: log every new payment =====
paymentSchema.post('save', async function (doc) {
  await AuditLog.create({
    action: 'PAYMENT_CREATED',
    collectionName: 'payments',
    documentId: doc._id,
    details: `Payment of Rs. ${doc.amount} recorded`
  });
});

module.exports = mongoose.model('Payment', paymentSchema);