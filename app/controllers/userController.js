const db = require('../../database');
const bcrypt = require('bcryptjs');

// ====== SQL 工具函数（保留原有）======
function executeSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function querySQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// 🔴 核心修改1：测试环境清理（控制器加载时立即执行，只执行一次）
(async function clearTestUsers() {
  // 只在 NODE_ENV=test 时执行（跑测试时显式设置该环境变量）
  if (process.env.NODE_ENV === 'test') {
    console.log("[TEST CLEANUP] 开始清理 users 表...");
    try {
      // 执行清空操作
      const result = await executeSQL("DELETE FROM users");
      console.log(`[TEST CLEANUP] 清理成功！删除了 ${result.changes} 条记录`);
    } catch (err) {
      console.error("[TEST CLEANUP] 清理失败：", err.message);
      throw err; // 清理失败直接抛出，避免测试继续
    }
  }
})(); // 立即执行函数（IIFE），确保控制器加载时就跑

// 密码加密函数（保留原有）
async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { salt, hashedPassword };
}

// ====== 注册用户（保留原有逻辑，移除内部清理）======
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, ...extra } = req.body;

    // 1. 多余字段检查
    if (Object.keys(extra).length > 0) {
      return res.status(400).json({ error_message: "Extra field(s) not allowed" });
    }

    // 2. 必填项校验
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error_message: "Missing required field(s)" });
    }

    // 3. 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error_message: "Invalid email format" });
    }

    // 4. 密码规则校验
    const passwordRules = {
      length: /^.{8,20}$/,
      number: /\d/,
      special: /[!@#$%^&*(),.?":{}|<>]/,
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/
    };
    if (!passwordRules.length.test(password)) return res.status(400).json({ error_message: "Password must be 8-20 characters" });
    if (!passwordRules.number.test(password)) return res.status(400).json({ error_message: "Password must contain a number" });
    if (!passwordRules.special.test(password)) return res.status(400).json({ error_message: "Password must contain a special character" });
    if (!passwordRules.uppercase.test(password)) return res.status(400).json({ error_message: "Password must contain an uppercase letter" });
    if (!passwordRules.lowercase.test(password)) return res.status(400).json({ error_message: "Password must contain a lowercase letter" });

    // 5. 重复邮箱检查（返回400，匹配测试用例）
    const existing = await querySQL("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error_message: "Email already exists" });
    }

    // 6. 密码加密
    const { salt, hashedPassword } = await hashPassword(password);

    // 7. 插入新用户
    const result = await executeSQL(
      "INSERT INTO users (first_name, last_name, email, password, salt, session_token) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, salt, null]
    );

    return res.status(201).json({ user_id: result.lastID });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error_message: "Internal server error" });
  }
};