const mongoose = require('mongoose');

const screenshotSchema = new mongoose.Schema({
  url: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const appSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  longDescription: { type: String, required: true },
  developerName: { type: String, trim: true },
  packageName: { type: String, required: true, unique: true, trim: true },
  playStoreUrl: { type: String, required: true },
  iconUrl: { type: String, required: true },
  priceType: { type: String, enum: ['free', 'paid', 'freemium'], default: 'free' },
  playStoreRating: { type: Number, min: 0, max: 5, default: 0 },
  categories: [{ type: String, index: true }],
  screenshots: [screenshotSchema],
  features: [{ type: String }],
  pros: [{ type: String }],
  cons: [{ type: String }],
  ratingStats: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  isNewApp: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

appSchema.index({ name: 'text', shortDescription: 'text' });
appSchema.index({ status: 1, isNewApp: 1 });
appSchema.index({ status: 1, viewCount: -1 });

module.exports = mongoose.model('App', appSchema);
