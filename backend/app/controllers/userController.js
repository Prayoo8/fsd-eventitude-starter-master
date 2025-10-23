const db = require('../../database');
const bcrypt = require('bcryptjs');

// ====== SQL utility functions (keep original) ======
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

// 🔴 Core modification 1: Test environment cleanup (executed immediately when controller loads, only once)
(async function clearTestUsers() {
  // Only execute when NODE_ENV=test (explicitly set this environment variable when running tests)
  if (process.env.NODE_ENV === 'test') {
    console.log("[TEST CLEANUP] Starting to clean users table...");
    try {
      // Execute cleanup operation
      const result = await executeSQL("DELETE FROM users");
      console.log(`[TEST CLEANUP] Cleanup successful! Deleted ${result.changes} records`);
    } catch (err) {
      console.error("[TEST CLEANUP] Cleanup failed:", err.message);
      throw err; // Throw directly if cleanup fails, avoid continuing tests
    }
  }
})(); // Immediately executed function (IIFE), ensures cleanup runs when controller loads

// Password encryption function (keep original)
async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { salt, hashedPassword };
}

// ====== Register user (keep original logic, remove internal cleanup) ======
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, ...extra } = req.body;

    // 1. Extra fields check
    if (Object.keys(extra).length > 0) {
      return res.status(400).json({ error_message: "Extra field(s) not allowed" });
    }

    // 2. Required fields validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error_message: "Missing required field(s)" });
    }

    // 3. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error_message: "Invalid email format" });
    }

    // 4. Password rules validation
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

    // 5. Duplicate email check (return 400, match test cases)
    const existing = await querySQL("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error_message: "Email already exists" });
    }

    // 6. Password encryption
    const { salt, hashedPassword } = await hashPassword(password);

    // 7. Insert new user
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