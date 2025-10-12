const db = require('../../database'); // 正确的相对路径

// 1. 创建事件（关联创建者 ID）
exports.createEvent = async (eventData, creatorId) => {
  const { name, description, location, start, max_attendees, close_registration, category_ids } = eventData;
  const start_date = start;

  // 插入 events 表（使用 start_date 字段匹配数据库表结构）
  const eventSql = `
    INSERT INTO events (creator_id, name, description, location, start_date, max_attendees, close_registration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const eventParams = [creatorId, name, description, location, start_date, max_attendees, close_registration];

  return new Promise((resolve, reject) => {
    db.run(eventSql, eventParams, function (err) {
      if (err) {
        console.error('[eventModel.createEvent] 数据库错误:', err);
        reject(err);
        return;
      }
      const eventId = this.lastID;

      // 扩展任务 2：关联事件与分类（如果需要）
      if (category_ids && category_ids.length > 0) {
        const categorySql = `
          INSERT INTO event_categories (event_id, category_id)
          VALUES ${category_ids.map(() => '(?, ?)').join(', ')}
        `;
        const categoryParams = category_ids.flatMap(catId => [eventId, catId]);
        
        db.run(categorySql, categoryParams, (err) => {
          if (err) {
            console.error('[eventModel.createEvent] 分类关联失败:', err);
            reject(err);
          } else {
            resolve(eventId);
          }
        });
      } else {
        resolve(eventId);
      }
    });
  });
};

// 2. 查询所有事件
exports.getAllEvents = async (categoryId = null) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT e.*, u.first_name || ' ' || u.last_name AS creator_name
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
    `;
    const params = [];

    // 扩展任务 2：按分类筛选事件
    if (categoryId) {
      sql += `
        JOIN event_categories ec ON e.event_id = ec.event_id
        WHERE ec.category_id = ?
      `;
      params.push(categoryId);
    }

    sql += ' ORDER BY e.start_date DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('[eventModel.getAllEvents] 数据库错误:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// 3. 按 ID 查询单个事件
exports.getEventById = async (eventId) => {
  return new Promise((resolve, reject) => {
    const eventSql = `
      SELECT e.*, u.first_name || ' ' || u.last_name AS creator_name
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      WHERE e.event_id = ?
    `;
    
    db.get(eventSql, [eventId], async (err, event) => {
      if (err) {
        console.error('[eventModel.getEventById] 数据库错误:', err);
        reject(err);
        return;
      }
      
      if (!event) {
        resolve(null);
        return;
      }

      // 扩展任务 2：查询事件关联的分类
      const categorySql = `
        SELECT c.category_id, c.name
        FROM categories c
        JOIN event_categories ec ON c.category_id = ec.category_id
        WHERE ec.event_id = ?
      `;
      
      db.all(categorySql, [eventId], (err, categories) => {
        if (err) {
          // 如果分类表不存在，忽略错误
          event.categories = [];
        } else {
          event.categories = categories;
        }
        resolve(event);
      });
    });
  });
};