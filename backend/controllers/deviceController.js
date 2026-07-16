const Device = require('../models/Device');

const register = async (req, res, next) => {
  try {
    const { fcmToken, platform } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId: req.deviceId },
      { fcmToken: fcmToken || null, platform, lastActiveAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Device registered', deviceId: device.deviceId });
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
