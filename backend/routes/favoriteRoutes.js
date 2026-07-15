const express = require('express');
const { list, add, remove, check } = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/:appId/check', check);
router.post('/:appId', add);
router.delete('/:appId', remove);

module.exports = router;
