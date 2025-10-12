const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'eventitude_2025_secret';

// 用于存储已登录用户的有效token（开发环境临时方案）
const activeTokens = new Map(); // key: user_id, value: { token, expiresAt }

// 登录处理
exports.login = async (req, res) => {
  try {
    const { email, password, ...extraFields } = req.body;

    // 打印请求的邮箱和密码（仅测试环境用，生产环境删除）
    console.log('登录请求 - 邮箱:', email, '密码:', password);

    // 1. 校验是否有额外字段
    if (Object.keys(extraFields).length > 0) {
      console.log('登录失败 - 存在额外字段:', extraFields); // 新增日志
      return res.status(400).json({
        error_message: '请求包含无效字段'
      });
    }

    // 2. 校验必填字段
    if (!email || !password) {
      console.log('登录失败 - 缺少邮箱或密码'); // 新增日志
      return res.status(400).json({
        error_message: 'email 和 password 为必填字段'
      });
    }

    // 3. 查询用户
    const user = await userModel.getUserByEmail(email);
    console.log('查询到的用户:', user); // 新增日志：打印查询结果（关键！）

    if (!user) {
      console.log('登录失败 - 未查询到用户，邮箱:', email); // 新增日志
      return res.status(400).json({
        error_message: '邮箱或密码错误'
      });
    }

    // 4. 验证密码
    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    console.log('密码验证结果:', isPasswordValid); // 新增日志：打印验证结果（关键！）
    console.log('数据库存储的密码:', user.password); // 新增日志：打印数据库中的密码

    if (!isPasswordValid) {
      console.log('登录失败 - 密码验证不通过'); // 新增日志
      return res.status(400).json({
        error_message: '邮箱或密码错误'
      });
    }

    // 5. 检查是否已有有效token，有则复用
    const existingToken = activeTokens.get(user.user_id);
    if (existingToken && existingToken.expiresAt > Date.now()) {
      console.log('登录成功 - 复用已有token'); // 新增日志
      return res.status(200).json({
        user_id: user.user_id,
        session_token: existingToken.token
      });
    }

    // 6. 生成新token并存储
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    activeTokens.set(user.user_id, {
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    console.log('登录成功 - 生成新token'); // 新增日志
    res.status(200).json({
      user_id: user.user_id,
      session_token: token
    });

  } catch (err) {
    console.error('登录异常:', err); // 新增日志：打印异常详情
    res.status(500).json({
      error_message: '登录失败：' + err.message
    });
  }
};

// 登出处理（保持不变，无需修改）
exports.logout = async (req, res) => {
  try {
    const token = req.get('X-Authorization');
    
    if (!token) {
      return res.status(401).json({
        error_message: '未提供认证token'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error_message: '无效的token'
      });
    }

    activeTokens.delete(decoded.user_id);
    res.status(200).send();

  } catch (err) {
    res.status(500).json({
      error_message: '登出失败：' + err.message
    });
  }
};
