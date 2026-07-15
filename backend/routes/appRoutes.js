const express = require('express');
const {
  list, getById, getBySlug, incrementView,
  getDailyFeatured, getTrending, getNewApps,
} = require('../controllers/appController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', list);
router.get('/trending', getTrending);
router.get('/new', getNewApps);
router.get('/daily-featured', getDailyFeatured);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);
router.post('/:id/view', authMiddleware, incrementView);

module.exports = router;
