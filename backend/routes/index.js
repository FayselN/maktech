const express = require('express');
const appRoutes = require('./appRoutes');
const categoryRoutes = require('./categoryRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const deviceRoutes = require('./deviceRoutes');
const { versionCheck } = require('../controllers/appVersionCheckController');
const sunsetMiddleware = require('../middleware/sunsetMiddleware');

const router = express.Router();

// Must be registered before appRoutes & sunsetMiddleware: clients can always query version status
router.get('/apps/version-check', versionCheck);

// Intercept all legacy content routes and return 426 Upgrade Required to force update
router.use(sunsetMiddleware);

router.use('/apps', appRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/devices', deviceRoutes);

module.exports = router;
