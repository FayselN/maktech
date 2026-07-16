const express = require('express');
const { listByApp, create, update, remove } = require('../controllers/reviewController');
const deviceMiddleware = require('../middleware/deviceMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createReviewSchema } = require('../validators/reviewValidator');

const router = express.Router();

router.get('/apps/:appId/reviews', listByApp);
router.post('/apps/:appId/reviews', deviceMiddleware, validate(createReviewSchema), create);
router.put('/apps/:appId/reviews/:reviewId', deviceMiddleware, update);
router.delete('/apps/:appId/reviews/:reviewId', deviceMiddleware, remove);

module.exports = router;
