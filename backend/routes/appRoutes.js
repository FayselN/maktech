const express = require('express');
const {
  list, getById, getBySlug, incrementView,
  getDailyFeatured, getTrending, getNewApps, getRecentlyViewed,
} = require('../controllers/appController');
const deviceMiddleware = require('../middleware/deviceMiddleware');

const router = express.Router();

router.get('/', list);
router.get('/trending', getTrending);
router.get('/new', getNewApps);
router.get('/daily-featured', getDailyFeatured);
router.get('/recently-viewed', deviceMiddleware, getRecentlyViewed);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/:id/view', deviceMiddleware, incrementView);

module.exports = router;
