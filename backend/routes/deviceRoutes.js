const express = require('express');
const { register } = require('../controllers/deviceController');
const deviceMiddleware = require('../middleware/deviceMiddleware');

const router = express.Router();

router.post('/', deviceMiddleware, register);

module.exports = router;
