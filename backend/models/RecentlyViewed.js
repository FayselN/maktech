const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  viewedAt: { type: Date, default: Date.now }
});

recentlyViewedSchema.index({ deviceId: 1, viewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
