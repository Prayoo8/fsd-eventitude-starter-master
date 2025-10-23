const { executeSQL } = require('../../database');
const { filterText } = require('../utils/profanityFilter'); // Extension task 1: Filter profanity
const db = require('../../database');
// 1. Create question for event (with profanity filtering)
exports.createQuestion = async (questionData) => {
  const { event_id, question, asked_by } = questionData;
  
  // Extension task 1: Filter profanity in question
  const cleanedQuestion = filterText(question);

  const sql = 
  ' INSERT INTO questions (event_id, asked_by, question, votes) VALUES (?, ?, ?, 0)';
  const params = [event_id, asked_by, cleanedQuestion];

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Return question_id
      }
    });
  });
};

// 2. Query all questions by event ID
exports.getQuestionsByEventId = async (eventId) => {
  const sql = `
    SELECT q.*,u.user_id, u.first_name ,u.last_name
    FROM questions q
    JOIN users u ON q.asked_by = u.user_id
    WHERE q.event_id = ?
    ORDER BY q.votes DESC 
  `;
  return new Promise((resolve, reject) => {
    db.all(sql, [eventId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Check if user has already voted
exports.isVoted = async (questionId, userId) => {
  const sql = `
    SELECT * FROM votes
    WHERE question_id = ? AND voter_id = ?
  `;
  const params = [questionId, userId];
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
};

// 3. 为问题投票（自增 1）
exports.voteQuestion = (questionId, userId) => {
  const sql = `
    UPDATE questions
    SET votes = votes + 1
    WHERE question_id = ?
  `;
  const sql2 = `
  INSERT INTO votes (question_id, voter_id) VALUES (?, ?)
  `;
  const params = [questionId];
  const params2 = [questionId, userId];
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        db.run(sql2, params2, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      }
    });
  });
};

//为问题减一票
exports.downvoteQuestion = async (questionId, userId) => {
  const sql = `
    UPDATE questions
    SET votes = votes - 1
    WHERE question_id = ?
  `;
  const sql2 = `
    INSERT INTO votes (question_id, voter_id) VALUES (?, ?)
  `;
  const params = [questionId];
  const params2 = [questionId, userId];
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        db.run(sql2, params2, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      }
    });
  });
};

//删除问题
exports.deleteQuestion = async (questionId) => {
  const sql = `
    DELETE FROM questions
    WHERE question_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [questionId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

exports.getQuestionById = async (questionId) => {
  const sql = `
    SELECT * FROM questions
    WHERE question_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.get(sql, [questionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

//查询问题是否存在
exports.isQuestionExists = async (questionId) => {
  const sql = `
    SELECT * FROM questions
    WHERE question_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.get(sql, [questionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
};