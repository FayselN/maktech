const express = require('express');
const { list, add, remove, check } = require('../controllers/favoriteController');
const deviceMiddleware = require('../middleware/deviceMiddleware');

const router = express.Router();

router.use(deviceMiddleware);

router.get('/', list);
router.get('/:appId/check', check);
router.post('/:appId', add);
router.delete('/:appId', remove);

module.exports = router;
