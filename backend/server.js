require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Mongoose Schema
const eventSchema = new mongoose.Schema({
  type: String, // click or conversion
  timestamp: { type: Date, default: Date.now },
  metadata: Object
});
const Event = mongoose.model('Event', eventSchema);

// API Endpoint
app.post('/event', async (req, res) => {
  try {
    const { type, metadata } = req.body;
    const event = new Event({ type, metadata });
    await event.save();
    res.json({ message: '✅ Event saved', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
