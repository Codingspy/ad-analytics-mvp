require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors(

  {
    origin: ['https://ad-analytics-frontend.onrender.com', 'http://localhost:8080'],

  }
));

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

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ message: '✅ User registered!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Registration failed' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1d' });
  res.json({ token });
});


const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token' });

  const token = header.split(' ')[1];
  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API Endpoint
app.post('/event', authMiddleware, async (req, res) => {
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

const Campaign = require('./models/Campaign');

app.post('/campaign', authMiddleware, async (req, res) => {
  const { name, budget } = req.body;
  const campaign = new Campaign({ userId: req.user.userId, name, budget });
  await campaign.save();
  res.json({ campaign });
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
