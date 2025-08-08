const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  budget: Number,
});

module.exports = mongoose.model('Campaign', CampaignSchema);
