const UserNotification = require('../models/UserNotification');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      UserNotification.find({ userId: req.user._id })
        .populate('notificationId')
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserNotification.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      notifications: notifications.map((n) => ({
        ...n.notificationId.toObject(),
        isRead: n.isRead,
        userNotificationId: n._id,
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
    const notification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
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
    await UserNotification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, markAsRead, markAllAsRead };
