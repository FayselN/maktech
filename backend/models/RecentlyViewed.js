const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  viewedAt: { type: Date, default: Date.now },
});

recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
