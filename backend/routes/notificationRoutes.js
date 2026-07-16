const express = require('express');
const { list, markAsRead, markAllAsRead, clearAll } = require('../controllers/notificationController');
const deviceMiddleware = require('../middleware/deviceMiddleware');

const router = express.Router();

router.use(deviceMiddleware);

router.get('/', list);
router.put('/read-all', markAllAsRead);
router.delete('/', clearAll);
router.put('/:id/read', markAsRead);

module.exports = router;
