const bcrypt = require('bcryptjs');
const fs = require('fs');

// 读取 tests/data/good_user_data.json
const goodUserData = require('./tests/data/good_user_data.json');

// 批量生成加密密码 + 输出 SQL 更新语句
async function generateHashedSQL() {
  for (const user of goodUserData) {
    const { email, password } = user;
    // 生成 bcrypt 盐和哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // 输出可直接执行的 SQL 语句
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = '${email}';`);
  }
}

generateHashedSQL();