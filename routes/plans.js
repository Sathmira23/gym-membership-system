const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// සියලු plans ගන්න
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// අලුත් plan එකක් හදන්න
router.post('/', async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// plan එකක් update කරන්න
router.put('/:id', async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// plan එකක් delete කරන්න
router.delete('/:id', async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;