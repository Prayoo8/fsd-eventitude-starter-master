const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 注册用户（POST /users，无需认证）
router.post('/', userController.register);

module.exports = router; // 必须导出 router，供 server.js 注册