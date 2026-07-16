const mongoose = require('mongoose');

const deviceNotificationSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  isRead: { type: Boolean, default: false },
  receivedAt: { type: Date, default: Date.now }
});

deviceNotificationSchema.index({ deviceId: 1, isRead: 1 });
deviceNotificationSchema.index({ deviceId: 1, notificationId: 1 }, { unique: true });

module.exports = mongoose.model('DeviceNotification', deviceNotificationSchema);
