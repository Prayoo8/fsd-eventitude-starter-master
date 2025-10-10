const db = require('../../database');
const bcrypt = require('bcryptjs'); // 密码加密依赖（需 npm install bcryptjs）

// 输入验证函数
const validateUserData = (userData) => {
  const { first_name, last_name, email, password } = userData;
  const errors = [];

  // 验证必填字段
  if (!first_name || first_name.trim() === '') errors.push('first_name is required');
  if (!last_name || last_name.trim() === '') errors.push('last_name is required');
  if (!email || email.trim() === '') errors.push('email is required');
  if (!password) errors.push('password is required');

  // 验证邮箱格式
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('invalid email format');
  }

  // 验证字段类型
  if (first_name && typeof first_name !== 'string') errors.push('first_name must be a string');
  if (last_name && typeof last_name !== 'string') errors.push('last_name must be a string');
  if (email && typeof email !== 'string') errors.push('email must be a string');
  if (password && typeof password !== 'string') errors.push('password must be a string');

  return errors;
};

// 1. 注册新用户（返回新用户 ID）
exports.createUser = async (userData) => {
  // 输入验证
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid user data: ${validationErrors.join(', ')}`);
  }

  const { first_name, last_name, email, password } = userData;

  try {
    // 检查邮箱是否已存在（避免依赖数据库约束）
    const existingUser = await exports.getUserByEmail(email);
    if (existingUser) {
      throw new Error('邮箱已注册');
    }

    // 生成 salt + hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO users (first_name, last_name, email, password, salt)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(), // 邮箱统一转为小写
      hashedPassword,
      salt
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          // 双重保险：处理数据库层面的约束错误
          if (err.code === 'SQLITE_CONSTRAINT') {
            reject(new Error('邮箱已注册'));
          } else {
            reject(new Error(`Database error: ${err.message}`));
          }
        } else {
          resolve(this.lastID); // 返回自增的 user_id
        }
      });
    });
  } catch (err) {
    // 统一错误处理
    if (err.message === '邮箱已注册') {
      throw err;
    }
    throw new Error(`Failed to create user: ${err.message}`);
  }
};

// 2. 按邮箱查询用户（登录验证用）
exports.getUserByEmail = (email) => {
  if (!email) {
    return Promise.reject(new Error('email is required'));
  }

  // 邮箱统一转为小写查询，避免大小写问题
  const normalizedEmail = email.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
      if (err) {
        reject(new Error(`Database error: ${err.message}`));
      } else {
        resolve(row || null); // 如果查不到返回 null
      }
    });
  });
};

// 3. 验证密码
exports.verifyPassword = async (inputPassword, storedHash) => {
  if (!inputPassword || !storedHash) {
    throw new Error('inputPassword and storedHash are required');
  }

  try {
    return await bcrypt.compare(inputPassword, storedHash);
  } catch (err) {
    throw new Error(`Password verification failed: ${err.message}`);
  }
};

// 4. 新增：按ID查询用户
exports.getUserById = (userId) => {
  if (!userId || isNaN(Number(userId))) {
    return Promise.reject(new Error('valid user ID is required'));
  }

  return new Promise((resolve, reject) => {
    db.get('SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?', 
      [userId], 
      (err, row) => {
        if (err) {
          reject(new Error(`Database error: ${err.message}`));
        } else {
          resolve(row || null);
        }
      }
    );
  });
};
    