const express = require('express');
const { send, listAll } = require('../../controllers/admin/adminNotificationController');

const router = express.Router();

router.get('/', listAll);
router.post('/', send);

module.exports = router;
