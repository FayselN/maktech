const DeviceNotification = require('../models/DeviceNotification');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      DeviceNotification.find({ deviceId: req.deviceId })
        .populate('notificationId')
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DeviceNotification.countDocuments({ deviceId: req.deviceId }),
    ]);

    res.json({
      notifications: notifications.map((n) => ({
        ...n.notificationId.toObject(),
        isRead: n.isRead,
        deviceNotificationId: n._id,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await DeviceNotification.findOneAndUpdate(
      { _id: req.params.id, deviceId: req.deviceId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await DeviceNotification.updateMany(
      { deviceId: req.deviceId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const clearAll = async (req, res, next) => {
  try {
    await DeviceNotification.deleteMany({ deviceId: req.deviceId });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, markAsRead, markAllAsRead, clearAll };
