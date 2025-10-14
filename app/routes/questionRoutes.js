const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth'); // 需认证

// 所有问题接口均需登录
try{
router.use(authenticateToken);} catch(error){
    console.error('Error in questionRoutes:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        error_message: '问题接口认证失败：' + error.message
    });
}

// 1. 创建问题（POST /questions）
router.post('/', questionController.createQuestion);
// 2. 按事件 ID 查询问题（GET /events/:eventId/questions）
router.get('/events/:eventId/questions', questionController.getQuestionsByEventId);
// 3. 为问题投票（POST /questions/:questionId/vote）
router.post('/:questionId/vote', questionController.voteQuestion);

module.exports = router;