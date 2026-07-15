const AdminActivityLog = require('../models/AdminActivityLog');

const logActivity = async ({ adminId, action, targetType, targetId, changes }) => {
  try {
    await AdminActivityLog.create({ adminId, action, targetType, targetId, changes });
  } catch (error) {
    console.error('Failed to log admin activity:', error.message);
  }
};

module.exports = logActivity;
