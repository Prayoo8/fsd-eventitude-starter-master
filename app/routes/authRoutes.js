const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录：POST /login（与测试请求的路径一致）
router.post('/login', authController.login);

// 登出：POST /logout（补充测试需要的登出路由）
router.post('/logout', authController.logout);

module.exports = router;