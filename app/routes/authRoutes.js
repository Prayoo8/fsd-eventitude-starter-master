const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录（POST /auth/login，无需认证）
router.post('/login', authController.login);

module.exports = router;