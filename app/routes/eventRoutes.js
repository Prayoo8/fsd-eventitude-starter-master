const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth'); // 需认证

// 所有事件接口均需登录（ Swagger 要求）
router.use(authenticateToken);

// 1. 创建事件（POST /events）
router.post('/', eventController.createEvent);
// 2. 查询所有事件（GET /events）
router.get('/', eventController.getAllEvents);
// 3. 按 ID 查询事件（GET /events/:eventId）
router.get('/:eventId', eventController.getEventById);

module.exports = router;