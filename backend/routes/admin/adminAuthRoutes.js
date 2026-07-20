const express = require('express');
const { login, getMe, changePassword } = require('../../controllers/admin/adminAuthController');
const authMiddleware = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');
const { loginSchema, changePasswordSchema } = require('../../validators/authValidator');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);

module.exports = router;
