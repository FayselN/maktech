const express = require('express');
const appRoutes = require('./appRoutes');
const categoryRoutes = require('./categoryRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const deviceRoutes = require('./deviceRoutes');

const router = express.Router();

router.use('/apps', appRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/devices', deviceRoutes);

module.exports = router;
