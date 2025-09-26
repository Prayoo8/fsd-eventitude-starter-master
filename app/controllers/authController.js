const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken'); // 需 npm install jsonwebtoken
const JWT_SECRET = 'eventitude_2025_secret'; // 与中间件一致

// 登录（POST /auth/login，）
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 校验必填字段
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        error_message: 'email 和 password 为必填字段'
      });
    }

    // 2. 查询用户
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        error_message: '邮箱或密码错误'
      });
    }

    // 3. 验证密码
    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        error_message: '邮箱或密码错误'
      });
    }

    // 4. 生成 JWT 令牌（有效期 24 小时）
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. 成功响应（返回令牌和用户基本信息）
    res.status(200).json({
      message: '登录成功',
      session_token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({
      error: 'Internal Server Error',
      error_message: '登录失败：' + err.message
    });
  }
};
