const express = require('express');
const { list, getBySlug } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', list);
router.get('/:slug', getBySlug);

module.exports = router;
