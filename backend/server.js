require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');

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


   

    res.json({ message: '✅ Event saved to MongoDB & ES', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error' });
  }
});


const esClient = new Client({
  node: process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'elastic' // Default dev password if needed — for 8.x you'll usually set password or use API key
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Check connection
(async () => {
  try {
    const health = await esClient.cluster.health();
    console.log('✅ Elasticsearch connected:', health.body);
  } catch (err) {
    console.error('❌ Elasticsearch connection error:', err);
  }
})();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
