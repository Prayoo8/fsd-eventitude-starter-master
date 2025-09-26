const userModel = require('../models/userModel');

// 1. 注册用户（POST /users，）
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // 1. 校验必填字段（匹配测试脚本的 400 断言，）
    if (!first_name) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'first_name 为必填字段'
      });
    }
    if (!last_name) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'last_name 为必填字段'
      });
    }
    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'email 为必填字段'
      });
    }
    if (!password) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'password 为必填字段'
      });
    }

    // 2. 校验邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: '邮箱格式无效（示例：user@example.com）'
      });
    }

    // 3. 校验额外字段（匹配测试脚本的“extra field”场景，）
    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: `不允许额外字段：${extraFields.join(', ')}`
      });
    }

    // 4. 创建用户
    const userId = await userModel.createUser(req.body);

    // 5. 成功响应（匹配测试脚本的 201 + user_id 断言，）
    res.status(201).json({
      message: '用户注册成功',
      user_id: userId,
      email: email
    });

  } catch (err) {
    if (err.message === '邮箱已注册') {
      return res.status(409).json({
        error: 'Conflict',
        error_message: '邮箱已被注册，请更换邮箱'
      });
    }
    // 服务器错误响应
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '用户注册失败：' + err.message
    });
  }
};