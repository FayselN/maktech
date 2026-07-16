const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true }
}, { timestamps: true });

favoriteSchema.index({ deviceId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
