const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  durationMonths: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);