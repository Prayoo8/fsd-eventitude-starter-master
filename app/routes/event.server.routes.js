const express = require('express');
const router = express.Router();
// 正确引入数据库对象！路径是相对于当前文件的
const db = require('../../database');

/**
 * @route GET /api/events
 * @description 获取所有活动的列表
 * @access Public
 */
router.get('/events', async (req, res) => {
  console.log('GET /api/events request received'); // 帮助调试，确认路由被调用

  try {
    // 1. 编写SQL：查询events表的所有数据
    const sql = `SELECT * FROM events;`;

    // 2. 执行数据库查询
    // db.all() 用于执行查询并返回所有结果行
    db.all(sql, [], (err, rows) => {
      if (err) {
        // 如果查询出错
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch events from database' });
      }

      // 3. 成功返回数据
      console.log(`Returning ${rows.length} events`); // 帮助调试
      res.json(rows); // 将数据库查询结果直接作为JSON数组返回
    });

    // 注意：我们使用回调函数风格，因为sqlite3库默认是这种风格。
    // 也可以使用util.promisify把它变成Promise风格，但当前这样最直接。

  } catch (error) {
    // 捕获同步错误（例如上面的db.all()之前的错误）
    console.error('Unexpected error in /api/events:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 导出路由函数，符合server.js中的要求
module.exports = function(app) {
  // 所有在这个路由器中定义的路由都将以 "/api" 为前缀
  app.use('/api', router);
};


/**
 * @route POST /api/events
 * @description 创建一个新活动
 * @access Public (后续会改为需要认证)
 */
router.post('/events', async (req, res) => {
  console.log('POST /api/events request received', req.body); // 调试用

  try {
    // 1. 从请求体中获取数据
    const { name, description, location, start_date, close_registration, max_attendees, creator_id } = req.body;

    // 2. 简单的数据验证
    if (!name || !description || !location || !start_date || !creator_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, location, start_date, and creator_id are required' 
      });
    }

    // 3. 构造SQL插入语句 - 使用参数化查询来防止SQL注入
    const sql = `
      INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 4. 准备参数数组（顺序必须与SQL中的问号顺序一致）
    const params = [
      name, 
      description, 
      location, 
      start_date, 
      close_registration || null, // 如果未提供，设为null
      max_attendees || null,      // 如果未提供，设为null
      creator_id
    ];

    // 5. 执行数据库插入操作
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create event' });
      }

      // 6. 成功响应 - 返回创建的活动ID和信息
      console.log(`Event created with ID: ${this.lastID}`);
      res.status(201).json({
        message: 'Event created successfully',
        event_id: this.lastID,
        event: {
          event_id: this.lastID,
          name,
          description,
          location,
          start_date,
          close_registration,
          max_attendees,
          creator_id
        }
      });
    });

  } catch (error) {
    // 7. 捕获意外错误
    console.error('Unexpected error in POST /api/events:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * @route PUT /api/events/:id
 * @description 更新指定ID的活动信息
 * @access Public
 */
router.put('/events/:id', async (req, res) => {
  const eventId = req.params.id; // 1. 从URL参数获取活动ID
  const updates = req.body;      // 2. 获取要更新的字段

  console.log(`PUT /api/events/${eventId} request received`, updates);

  try {
    // 3. 验证至少提供了一个可更新的字段
    const allowedFields = ['name', 'description', 'location', 'start_date', 'close_registration', 'max_attendees'];
    const providedFields = Object.keys(updates).filter(field => allowedFields.includes(field));
    
    if (providedFields.length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields provided for update. Allowed fields: ' + allowedFields.join(', ')
      });
    }

    // 4. 构建动态SQL更新语句
    const setClauses = [];
    const values = [];
    
    // 遍历允许的字段，如果请求体中提供了该字段，就添加到更新语句中
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) { // 检查字段是否提供
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    // 5. 添加eventId到参数数组的最后（用于WHERE条件）
    values.push(eventId);
    
    // 6. 构建完整的SQL语句
    const sql = `UPDATE events SET ${setClauses.join(', ')} WHERE event_id = ?`;
    
    console.log('Generated SQL:', sql); // 调试用
    console.log('Parameters:', values); // 调试用

    // 7. 执行数据库更新
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to update event' });
      }
      
      // 8. 检查是否真的更新了数据
      if (this.changes === 0) {
        // 没有找到对应ID的活动
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // 9. 成功响应
      console.log(`Event ${eventId} updated successfully. Changes: ${this.changes}`);
      res.json({
        message: 'Event updated successfully',
        event_id: parseInt(eventId),
        changes: this.changes // 显示影响了多少行数据
      });
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/events/:id:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * @route DELETE /api/events/:id
 * @description 删除指定ID的活动
 * @access Public
 */
router.delete('/events/:id', async (req, res) => {
  const eventId = req.params.id;
  console.log(`DELETE /api/events/${eventId} request received`);

  try {
    const sql = `DELETE FROM events WHERE event_id = ?`;
    
    db.run(sql, [eventId], function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to delete event' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      console.log(`Event ${eventId} deleted successfully. Changes: ${this.changes}`);
      res.json({
        message: 'Event deleted successfully',
        event_id: parseInt(eventId)
      });
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/events/:id:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


