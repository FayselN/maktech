const mongoose = require('mongoose');

const reviewReportSchema = new mongoose.Schema({
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
  deviceId: { type: String, required: true },
  reason: { type: String, enum: ['spam', 'offensive', 'irrelevant', 'other'], default: 'other' },
  otherReason: { type: String, maxlength: 500 },
}, { timestamps: true });

reviewReportSchema.index({ reviewId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model('ReviewReport', reviewReportSchema);
