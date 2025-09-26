const eventModel = require('../models/eventModel');
const { hasProfanity } = require('../utils/profanityFilter'); // 扩展任务 1

// 1. 创建事件（POST /events，需认证，）
exports.createEvent = async (req, res) => {
  try {
    const { name, description, location, start_date, max_attendees, close_registration } = req.body;
    const creatorId = req.user.user_id; // 从认证中间件获取 user_id

    // 1. 校验必填字段
    const requiredFields = ['name', 'description', 'location', 'start_date', 'max_attendees', 'close_registration'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: `缺少必填字段：${missingFields.join(', ')}`
      });
    }

    // 2. 扩展任务 1：检查敏感词（若包含则提示，不强制过滤）
    if (hasProfanity(name) || hasProfanity(description)) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: '事件名称或描述包含敏感词，请修改后提交'
      });
    }

    // 3. 校验日期格式（ISO 格式，如 2025-10-30T13:00:00Z）
    const startDate = new Date(start_date);
    const closeDate = new Date(close_registration);
    if (isNaN(startDate.getTime()) || isNaN(closeDate.getTime())) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: '日期格式无效（需 ISO 格式，如 2025-10-30T13:00:00Z）'
      });
    }
    if (closeDate >= startDate) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: '报名截止日期必须早于事件开始日期'
      });
    }

    // 4. 创建事件
    const eventId = await eventModel.createEvent(req.body, creatorId);

    // 5. 成功响应
    res.status(201).json({
      message: '事件创建成功',
      event_id: eventId,
      event: req.body
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '事件创建失败：' + err.message
    });
  }
};

// 2. 查询所有事件（GET /events，需认证，）
exports.getAllEvents = async (req, res) => {
  try {
    const { category_id } = req.query; // 扩展任务 2：按分类筛选
    const events = await eventModel.getAllEvents(category_id);

    res.status(200).json({
      message: '事件查询成功',
      count: events.length,
      events: events
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '事件查询失败：' + err.message
    });
  }
};

// 3. 按 ID 查询事件（GET /events/:eventId，需认证，）
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await eventModel.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        error: 'Not Found',
        error_message: `ID 为 ${eventId} 的事件不存在`
      });
    }

    res.status(200).json({
      message: '事件查询成功',
      event: event
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '事件查询失败：' + err.message
    });
  }
};
