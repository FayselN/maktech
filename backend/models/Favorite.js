const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
}, { timestamps: true });

favoriteSchema.index({ userId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
