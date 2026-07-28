const express = require('express');
const adminAppRoutes = require('./adminAppRoutes');
const adminCategoryRoutes = require('./adminCategoryRoutes');
const adminFeaturedRoutes = require('./adminFeaturedRoutes');
const adminNotificationRoutes = require('./adminNotificationRoutes');
const adminActivityRoutes = require('./adminActivityRoutes');

const adminReviewRoutes = require('./adminReviewRoutes');

const router = express.Router();

router.use('/apps', adminAppRoutes);
router.use('/categories', adminCategoryRoutes);
router.use('/featured', adminFeaturedRoutes);
router.use('/notifications', adminNotificationRoutes);
router.use('/activity-log', adminActivityRoutes);
router.use('/reviews', adminReviewRoutes);

module.exports = router;
