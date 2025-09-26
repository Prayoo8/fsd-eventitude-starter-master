const { executeSQL } = require('../../database');

// 1. 创建事件（关联创建者 ID， events 表结构）
exports.createEvent = async (eventData, creatorId) => {
  const { name, description, location, start_date, max_attendees, close_registration, category_ids } = eventData;

  // 插入 events 表
  const eventSql = `
    INSERT INTO events (creator_id, name, description, location, start_date, max_attendees, close_registration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const eventParams = [creatorId, name, description, location, start_date, max_attendees, close_registration];

  return new Promise((resolve, reject) => {
    const db = require('./db').db;
    db.run(eventSql, eventParams, async function (err) {
      if (err) {
        reject(err);
        return;
      }
      const eventId = this.lastID;

      // 扩展任务 2：关联事件与分类（多对多，需先创建 categories 表）
      if (category_ids && category_ids.length > 0) {
        const categorySql = `
          INSERT INTO event_categories (event_id, category_id)
          VALUES ${category_ids.map(() => '(?, ?)').join(', ')}
        `;
        const categoryParams = category_ids.flatMap(catId => [eventId, catId]);
        await executeSQL(categorySql, categoryParams).catch(reject);
      }

      resolve(eventId);
    });
  });
};

// 2. 查询所有事件（关联创建者姓名，符合前端展示需求）
exports.getAllEvents = async (categoryId = null) => {
  let sql = `
    SELECT e.*, u.first_name || ' ' || u.last_name AS creator_name
    FROM events e
    JOIN user u ON e.creator_id = u.user_id
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
  return await executeSQL(sql, params);
};

// 3. 按 ID 查询单个事件（含分类信息， Swagger 要求）
exports.getEventById = async (eventId) => {
  // 查询事件基本信息
  const eventSql = `
    SELECT e.*, u.first_name || ' ' || u.last_name AS creator_name
    FROM events e
    JOIN user u ON e.creator_id = u.user_id
    WHERE e.event_id = ?
  `;
  const events = await executeSQL(eventSql, [eventId]);
  if (events.length === 0) return null;

  const event = events[0];

  // 扩展任务 2：查询事件关联的分类
  const categorySql = `
    SELECT c.category_id, c.name
    FROM categories c
    JOIN event_categories ec ON c.category_id = ec.category_id
    WHERE ec.event_id = ?
  `;
  event.categories = await executeSQL(categorySql, [eventId]);

  return event;
};