const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');

// සියලු members ගන්න (plan එකේ විස්තරත් එක්ක)
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().populate('plan').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// අලුත් member කෙනෙක් add කරන්න
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const member = await Member.create({ name, email, phone });
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// member කෙනෙක් update කරන්න (නම, email, phone විතරයි)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// member කෙනෙක් delete කරන්න (එයාගේ payments ත් එක්කම)
router.delete('/:id', async (req, res) => {
  try {
    await Payment.deleteMany({ member: req.params.id });
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;