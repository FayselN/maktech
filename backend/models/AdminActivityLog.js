const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: {
    type: String,
    enum: [
      'app_created', 'app_updated', 'app_deleted', 'category_created',
      'category_updated', 'category_deleted', 'app_published',
      'featured_set', 'notification_sent',
    ],
    required: true,
  },
  targetType: { type: String, enum: ['app', 'category', 'notification'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  changes: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

adminActivityLogSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
