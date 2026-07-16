const Notification = require('../../models/Notification');
const DeviceNotification = require('../../models/DeviceNotification');
const Device = require('../../models/Device');
const sendPushNotification = require('../../utils/sendPushNotification');
const logActivity = require('../../utils/logActivity');

const send = async (req, res, next) => {
  try {
    const { title, body, appId, type } = req.body;

    const notification = await Notification.create({
      title,
      body,
      appId: appId || null,
      type: type || 'general',
      sentBy: req.user._id,
    });

    const devices = await Device.find().select('deviceId');
    const deviceNotifications = devices.map((device) => ({
      deviceId: device.deviceId,
      notificationId: notification._id,
    }));

    if (deviceNotifications.length > 0) {
      await DeviceNotification.insertMany(deviceNotifications);
    }

    await sendPushNotification({
      title,
      body,
      data: { notificationId: notification._id.toString(), type, appId: appId || '' },
    });

    await logActivity({
      adminId: req.user._id,
      action: 'notification_sent',
      targetType: 'notification',
      targetId: notification._id,
      changes: { title, type },
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const listAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find()
        .populate('sentBy', 'name')
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(),
    ]);

    res.json({
      notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { send, listAll };
