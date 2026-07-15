const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });

reviewSchema.index({ appId: 1, createdAt: -1 });
reviewSchema.index({ appId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
