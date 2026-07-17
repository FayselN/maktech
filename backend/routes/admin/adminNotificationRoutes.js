const express = require('express');
const { send, listAll, remove } = require('../../controllers/admin/adminNotificationController');

const router = express.Router();

router.get('/', listAll);
router.post('/', send);
router.delete('/:id', remove);

module.exports = router;
