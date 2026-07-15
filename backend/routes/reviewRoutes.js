const express = require('express');
const { listByApp, create, update, remove } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createReviewSchema } = require('../validators/reviewValidator');

const router = express.Router();

router.get('/apps/:appId/reviews', listByApp);
router.post('/apps/:appId/reviews', authMiddleware, validate(createReviewSchema), create);
router.put('/apps/:appId/reviews/:reviewId', authMiddleware, update);
router.delete('/apps/:appId/reviews/:reviewId', authMiddleware, remove);

module.exports = router;
