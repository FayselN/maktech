const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', default: null },
  type: { type: String, enum: ['new_app', 'trending', 'general'], default: 'general' },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
