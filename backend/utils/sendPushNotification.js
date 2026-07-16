const { admin } = require('../config/firebase');
const Device = require('../models/Device');

const sendPushNotification = async ({ title, body, data }) => {
  try {
    const devices = await Device.find({ fcmToken: { $ne: null } }).select('fcmToken');
    const tokens = devices.map((d) => d.fcmToken).filter(Boolean);

    if (tokens.length === 0) return;

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(tokens[idx]);
      }
    });

    if (invalidTokens.length > 0) {
      await Device.updateMany(
        { fcmToken: { $in: invalidTokens } },
        { fcmToken: null }
      );
    }
  } catch (error) {
    console.error('Failed to send push notification:', error.message);
  }
};

module.exports = sendPushNotification;
