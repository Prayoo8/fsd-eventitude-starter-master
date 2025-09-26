// 引入sqlite3库（starter已安装，无需额外npm install）
const sqlite3 = require('sqlite3').verbose();
// 连接到已存在的db.sqlite数据库
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('数据库连接失败：', err.message);
  } else {
    console.log('SQLite数据库连接成功');
  }
});

// 封装通用的SQL执行函数（支持查询/插入/更新/删除）
// sql：SQL语句，params：参数数组（防止SQL注入）
const executeSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows); // 查询返回结果数组，插入/更新返回空数组（需自己处理自增ID）
      }
    });
  });
};

// 导出db实例和executeSQL函数，供其他model使用
module.exports = { db, executeSQL };