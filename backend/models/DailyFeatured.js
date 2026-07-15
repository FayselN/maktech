const mongoose = require('mongoose');

const dailyFeaturedSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  featuredDate: { type: Date, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('DailyFeatured', dailyFeaturedSchema);
