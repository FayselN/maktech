const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  isRead: { type: Boolean, default: false },
  receivedAt: { type: Date, default: Date.now },
});

userNotificationSchema.index({ userId: 1, isRead: 1 });
userNotificationSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

module.exports = mongoose.model('UserNotification', userNotificationSchema);
