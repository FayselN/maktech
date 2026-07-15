const express = require('express');
const { list } = require('../../controllers/admin/adminActivityController');

const router = express.Router();

router.get('/', list);

module.exports = router;
