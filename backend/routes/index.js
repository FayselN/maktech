const express = require('express');
const authRoutes = require('./authRoutes');
const appRoutes = require('./appRoutes');
const categoryRoutes = require('./categoryRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/apps', appRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/', reviewRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
