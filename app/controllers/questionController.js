const questionModel = require('../models/questionModel');

// 1. 为事件创建问题（POST /questions，需认证，）
exports.createQuestion = async (req, res) => {
  try {
    const { event_id, question } = req.body;
    const userId = req.user.user_id;

    // 1. 校验必填字段
    if (!event_id || !question) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'event_id 和 question 为必填字段'
      });
    }

    // 2. 校验事件是否存在（简化：直接调用事件模型查询）
    const eventModel = require('../models/eventModel');
    const event = await eventModel.getEventById(event_id);
    if (!event) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `ID 为 ${event_id} 的事件不存在，无法提问`
      });
    }

    // 3. 创建问题
    const questionId = await questionModel.createQuestion(req.body, userId);

    // 4. 成功响应
    res.status(201).json({
      message: '问题提交成功',
      question_id: questionId,
      question: question
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '问题提交失败：' + err.message
    });
  }
};

// 2. 按事件 ID 查询问题（GET /events/:eventId/questions，需认证，）
exports.getQuestionsByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // 1. 校验事件是否存在
    const eventModel = require('../models/eventModel');
    const event = await eventModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `ID 为 ${eventId} 的事件不存在`
      });
    }

    // 2. 查询问题
    const questions = await questionModel.getQuestionsByEventId(eventId);

    // 3. 成功响应
    res.status(200).json({
      message: `事件 ${eventId} 的问题查询成功`,
      count: questions.length,
      questions: questions
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '问题查询失败：' + err.message
    });
  }
};

// 3. 为问题投票（POST /questions/:questionId/vote，需认证，）
exports.voteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    // 1. 校验问题是否存在
    const questions = await questionModel.getQuestionsByEventId(req.body.event_id); // 简化：通过 event_id 关联
    const questionExists = questions.some(q => q.question_id == questionId);
    if (!questionExists) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `ID 为 ${questionId} 的问题不存在`
      });
    }

    // 2. 投票
    await questionModel.voteQuestion(questionId);

    // 3. 成功响应
    res.status(200).json({
      message: '投票成功',
      question_id: questionId
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '投票失败：' + err.message
    });
  }
};