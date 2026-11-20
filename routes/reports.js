const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');

// ===== PROCEDURE 1: Dashboard සාරාංශය =====
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // expiry date පහු වුණු members ලා "Expired" කරනවා
    await Member.updateMany(
      { status: 'Active', expiryDate: { $lt: now } },
      { $set: { status: 'Expired' } }
    );

    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'Active' });

    const income = await Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers: totalMembers - activeMembers,
      monthlyIncome: income.length ? income[0].total : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROCEDURE 2: දින 7ක් ඇතුළත expire වෙන members =====
router.get('/expiring-soon', async (req, res) => {
  try {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const members = await Member.find({
      expiryDate: { $gte: now, $lte: in7Days }
    }).populate('plan', 'name').sort({ expiryDate: 1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROCEDURE 3: මාසික revenue report (aggregation) =====
router.get('/monthly-revenue', async (req, res) => {
  try {
    const report = await Payment.aggregate([
      {
        $group: {
          _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
          totalRevenue: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROCEDURE 4: Latest audit log entries =====
router.get('/audit-log', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;