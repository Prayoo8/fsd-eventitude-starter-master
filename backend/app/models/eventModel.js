const db = require('../../database'); // Correct relative path

// 1. Create event (associate creator ID)
exports.createEvent = async (eventData, creatorId) => {
  const { name, description, location, start, max_attendees, close_registration, category_ids } = eventData;
  const start_date = start;

  const eventSql = `
    INSERT INTO events (creator_id, name, description, location, start_date, max_attendees, close_registration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const eventParams = [creatorId, name, description, location, start_date, max_attendees, close_registration];

  return new Promise((resolve, reject) => {
    db.run(eventSql, eventParams, function (err) {
      if (err) {
        console.error('[eventModel.createEvent] Database error:', err);
        reject(err);
        return;
      }
      const eventId = this.lastID;

      // If there are category_ids associations, can be extended (if categories table exists)
      if (category_ids && category_ids.length > 0) {
        const categorySql = `
          INSERT INTO event_categories (event_id, category_id)
          VALUES ${category_ids.map(() => '(?, ?)').join(', ')}
        `;
        const categoryParams = category_ids.flatMap(catId => [eventId, catId]);

        db.run(categorySql, categoryParams, (err) => {
          if (err) {
            console.error('[eventModel.createEvent] Category association failed:', err);
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

// 2. Query all events
exports.getAllEvents = async (categoryId = null) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT e.*, u.first_name || ' ' || u.last_name AS creator_name
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
    `;
    const params = [];

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
        console.error('[eventModel.getAllEvents] Database error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.getEventById = async (eventId) => {
  return new Promise((resolve, reject) => {
    const eventSql = `
      SELECT e.*,u.first_name,u.last_name ,u.email as creator_email
      FROM events e
      JOIN users u ON e.creator_id = u.user_id
      WHERE e.event_id = ?
    `;

    db.get(eventSql, [eventId], (err, event) => {
      if (err) {
        console.error('[eventModel.getEventById] Database error:', err);
        reject(err);
        return;
      }
      if (!event) {
        resolve(null);
        return;
      }

      // If there is a category table, can query event categories
      const categorySql = `
        SELECT c.category_id, c.name
        FROM categories c
        JOIN event_categories ec ON c.category_id = ec.category_id
        WHERE ec.event_id = ?
      `;
      db.all(categorySql, [eventId], (err, categories) => {
        if (err) {
          event.categories = [];
        } else {
          event.categories = categories;
        }
        resolve(event);
      });
    });
  });
};

// 4. Update event
exports.updateEvent = async (eventId, updateData) => {
  return new Promise((resolve, reject) => {
    if (!updateData || Object.keys(updateData).length === 0) {
      return reject(new Error('Update data cannot be empty'));
    }

    const fields = Object.keys(updateData);
    const placeholders = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updateData[f]);

    const sql = `UPDATE events SET ${placeholders} WHERE event_id = ?`;
    const params = [...values, eventId];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('[eventModel.updateEvent] Database error:', err);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

// 5. Mark event as archived
exports.archiveEvent = async (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE events SET close_registration = -1 WHERE event_id = ?`;
    db.run(sql, [eventId], function (err) {
      if (err) {
        console.error('[eventModel.archiveEvent] Database error:', err);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

// 6. Check if user has registered for the event
exports.isUserRegistered = async (eventId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM attendees WHERE event_id = ? AND user_id = ?`;
    db.get(sql, [eventId, userId], (err, row) => {
      if (err) {
        console.error('[eventModel.isUserRegistered] Database error:', err);
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
};

// 7. Count registrations for an event
exports.countRegistrations = async (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) AS count FROM attendees WHERE event_id = ?`;
    db.get(sql, [eventId], (err, row) => {
      if (err) {
        console.error('[eventModel.countRegistrations] Database error:', err);
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
};

// 8. User registration for event
exports.registerUser = async (eventId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO attendees (event_id, user_id) VALUES (?, ?)`;
    db.run(sql, [eventId, userId], function (err) {
      if (err) {
        console.error('[eventModel.registerUser] Database error:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

//9. Check if user is the event creator
exports.isEventCreator = async (eventId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM events WHERE event_id = ? AND creator_id = ?`;
    db.get(sql, [eventId, userId], (err, row) => {
      if (err) {
        console.error('[eventModel.isEventCreator] Database error:', err);
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
};

//10. Check if user has registered for the event
exports.isUserRegistered = async (eventId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM attendees WHERE event_id = ? AND user_id = ?`;
    db.get(sql, [eventId, userId], (err, row) => {
      if (err) {
        console.error('[eventModel.isUserRegistered] Database error:', err);
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
};

exports.findById = async (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT e.*, u.first_name, u.last_name, u.email as creator_email
                 FROM events e 
                 JOIN users u ON e.creator_id = u.user_id 
                 WHERE e.event_id = ?`;
    db.get(sql, [eventId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

exports.getAttendees = async (eventId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT u.user_id, u.first_name, u.last_name, u.email
                 FROM attendees a
                 JOIN users u ON a.user_id = u.user_id
                 WHERE a.event_id = ?`;
    db.all(sql, [eventId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

exports.searchEvents = async (filters) => {
  return new Promise((resolve,reject)=>{
  let sql = `SELECT e.*, u.first_name, u.last_name, u.email as creator_email
               FROM events e 
               JOIN users u ON e.creator_id = u.user_id 
               WHERE 1=1`;
    const values = [];
    
    if (filters.q) {
        sql += ' AND e.name LIKE ?';
        values.push(`%${filters.q}%`);
    }
    
    if (filters.status) {
        const now = Date.now();
        switch (filters.status) {
            case 'MY_EVENTS':
                sql += ' AND e.creator_id = ?';
                values.push(filters.userId);
                break;
            case 'ATTENDING':
                sql += ' AND e.event_id IN (SELECT event_id FROM attendees WHERE user_id = ?) AND e.creator_id != ?';
                values.push(filters.userId, filters.userId);
                break;
            case 'OPEN':
                sql += ' AND e.close_registration > ? AND e.close_registration != -1';
                values.push(now);
                break;
            case 'ARCHIVE':
                sql += ' AND e.close_registration < ?';
                console.log('ARCHIVE filter applied with timestamp:', now);
                values.push(now);
                break;
        }
    }
    
    sql += ' ORDER BY e.start_date ASC';
    
    if (filters.limit) {
        sql += ' LIMIT ?';
        values.push(filters.limit);
    }
    
    if (filters.offset) {
        sql += ' OFFSET ?';
        values.push(filters.offset);
    }
    
    db.all(
        sql,
        values,
        (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        }
    )
  })
}