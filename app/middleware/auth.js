const jwt = require('jsonwebtoken');
// JWT 密钥（保持与登录逻辑一致）
const JWT_SECRET = 'eventitude_2025_secret';

// 认证中间件：解析请求头中的 X-Authorization Token
exports.authenticateToken = (req, res, next) => {
  // 从 X-Authorization 头获取 Token（与测试用例的请求头一致）
  const token = req.get('X-Authorization'); 

  if (!token) {
    return res.status(401).json({
      error_message: '需要登录才能访问（缺少 X-Authorization Token）'
    });
  }

  // 验证 Token 有效性
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error_message: '令牌无效或已过期'
      });
    }
    // 将解码后的用户信息（含 user_id、email 等）挂载到 req，供后续控制器使用
    req.user = decoded; 
    next();
  });
};