const { executeSQL } = require('../../database');
const bcrypt = require('bcryptjs'); // 密码加密依赖（需 npm install bcryptjs）

// 1. 注册新用户（返回新用户 ID）
exports.createUser = async (userData) => {
  const { first_name, last_name, email, password } = userData;
  
  // 密码加密：生成 salt + hash（符合行业安全标准，）
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 插入 user 表（字段严格匹配作业文档表结构，）
  const sql = `
    INSERT INTO users (first_name, last_name, email, password, salt)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [first_name, last_name, email, hashedPassword, salt];

  return new Promise((resolve, reject) => {
    const db = require('./db').db;
    db.run(sql, params, function (err) {
      if (err) {
        // 处理邮箱重复（UNIQUE 约束，）
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          reject(new Error('邮箱已注册'));
        } else {
          reject(err);
        }
      } else {
        resolve(this.lastID); // 返回自增的 user_id
      }
    });
  });
};

// 2. 按邮箱查询用户（登录验证用）
exports.getUserByEmail = async (email) => {
  const sql = 'SELECT * FROM user WHERE email = ?';
  const users = await executeSQL(sql, [email]);
  return users.length > 0 ? users[0] : null; // 邮箱唯一，最多返回 1 条
};

// 3. 验证密码（登录时匹配输入密码与数据库 hash）
exports.verifyPassword = async (inputPassword, storedHash) => {
  // bcrypt.compare 自动提取 hash 中的 salt，无需单独存储
  return await bcrypt.compare(inputPassword, storedHash);
};