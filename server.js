require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Connection error:', err));
  
app.use('/api/plans', require('./routes/plans'));
app.use('/api/members', require('./routes/members'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Gym system server is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));