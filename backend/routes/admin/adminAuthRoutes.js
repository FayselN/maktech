const express = require('express');
const { login, getMe } = require('../../controllers/admin/adminAuthController');
const authMiddleware = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');
const { loginSchema } = require('../../validators/authValidator');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
