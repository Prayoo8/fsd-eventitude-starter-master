const express = require('express');
const router = express.Router();
const db = require('../../database');
const bcrypt = require('bcrypt'); // 需要安装: npm install bcrypt

// 用户注册
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // 验证必填字段
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  
  try {
    // 检查用户是否已存在
    db.get('SELECT user_id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // 哈希密码
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 插入新用户
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          res.status(201).json({
            message: 'User created successfully',
            user_id: this.lastID,
            username,
            email
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // 查找用户
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // 登录成功 - 在实际应用中这里应该生成JWT token
      res.json({
        message: 'Login successful',
        user_id: user.user_id,
        username: user.username,
        email: user.email
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = function(app) {
  app.use('/api', router);
};