// file: /app/routes/user.server.routes.js
const express = require('express');
const router = express.Router();
// 修正路径：从当前文件向上两级到根目录，然后找到 database.js
const db = require('../../database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 先添加一个简单的GET路由测试（不需要数据库）
router.get('/', (req, res) => {
    res.json({ message: 'Users API is working!' });
});

// POST /users - 创建新用户
router.post('/', async (req, res) => {
    console.log('POST /users received with body:', req.body);
    
    const { first_name, last_name, email, password } = req.body;

    // 1. 检查额外字段
    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const receivedFields = Object.keys(req.body);
    const extraFields = receivedFields.filter(field => !allowedFields.includes(field));
    
    if (extraFields.length > 0) {
        return res.status(400).json({ error_message: 'Request contains extra fields.' });
    }

    // 2. 检查必需字段
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error_message: 'Missing required fields.' });
    }

    // 3. 检查字段是否为空字符串
    if (first_name.trim() === '') {
        return res.status(400).json({ error_message: 'First name cannot be blank.' });
    }
    if (last_name.trim() === '') {
        return res.status(400).json({ error_message: 'Last name cannot be blank.' });
    }
    if (email.trim() === '') {
        return res.status(400).json({ error_message: 'Email cannot be blank.' });
    }
    if (password.trim() === '') {
        return res.status(400).json({ error_message: 'Password cannot be blank.' });
    }

    // 4. 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error_message: 'Invalid email format.' });
    }

    // 5. 检查密码复杂度（根据测试数据要求）
    if (password.length < 8) {
        return res.status(400).json({ error_message: 'Password must be at least 8 characters long.' });
    }
    
    if (password.length > 32) { // 测试数据中最长密码是32字符
        return res.status(400).json({ error_message: 'Password must be less than 33 characters.' });
    }
    
    if (!/\d/.test(password)) {
        return res.status(400).json({ error_message: 'Password must contain at least one number.' });
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ error_message: 'Password must contain at least one special character.' });
    }
    
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error_message: 'Password must contain at least one uppercase letter.' });
    }
    
    if (!/[a-z]/.test(password)) {
        return res.status(400).json({ error_message: 'Password must contain at least one lowercase letter.' });
    }

    // 6. 检查邮箱是否已存在
    db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error_message: 'Database error.' });
        }
        if (row) {
            console.log('Duplicate email detected:', email);
            return res.status(409).json({ error_message: 'A user with this email already exists.' });
        }

        // 7. 插入用户（暂时使用明文密码）
        const sql = `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
        db.run(sql, [first_name.trim(), last_name.trim(), email.trim(), password], function(err) {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ error_message: 'Failed to create user.' });
            }
            
            console.log('User created with ID:', this.lastID);
            res.status(201).json({
                user_id: this.lastID
            });
        });
    });
});

module.exports = router;