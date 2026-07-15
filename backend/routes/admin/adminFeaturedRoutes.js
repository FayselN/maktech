const express = require('express');
const { setFeatured, getFeatured, listAll } = require('../../controllers/admin/adminFeaturedController');

const router = express.Router();

router.get('/', listAll);
router.get('/:date', getFeatured);
router.post('/', setFeatured);

module.exports = router;
