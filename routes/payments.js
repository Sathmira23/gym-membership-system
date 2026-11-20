const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// සියලු payments ගන්න
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('member', 'name email')
      .populate('plan', 'name price')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// අලුත් payment එකක් (මෙතනදී TRIGGER එක run වෙනවා 🔥)
router.post('/', async (req, res) => {
  try {
    const { member, plan } = req.body;
    const payment = await Payment.create({ member, plan });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;