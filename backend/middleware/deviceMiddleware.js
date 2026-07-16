const deviceMiddleware = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID required' });
  }
  req.deviceId = deviceId;
  next();
};

module.exports = deviceMiddleware;
