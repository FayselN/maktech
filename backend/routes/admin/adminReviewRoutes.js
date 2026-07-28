const express = require('express');
const { getFlagged, moderate } = require('../../controllers/admin/adminReviewController');

const router = express.Router();

router.get('/flagged', getFlagged);
router.put('/:id/moderate', moderate);

module.exports = router;
