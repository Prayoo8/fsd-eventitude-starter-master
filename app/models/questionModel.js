const { executeSQL } = require('../../database');
const { filterText } = require('../utils/profanityFilter'); // 扩展任务 1：过滤敏感词

// 1. 为事件创建问题（含脏话过滤，）
exports.createQuestion = async (questionData, userId) => {
  const { event_id, question } = questionData;
  
  // 扩展任务 1：过滤问题中的敏感词
  const cleanedQuestion = filterText(question);

  const sql = `
    INSERT INTO questions (event_id, asked_by, question, votes)
    VALUES (?, ?, ?, 0) // votes 初始为 0，
  `;
  const params = [event_id, userId, cleanedQuestion];

  return new Promise((resolve, reject) => {
    const db = require('./db').db;
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // 返回 question_id
      }
    });
  });
};

// 2. 按事件 ID 查询所有问题
exports.getQuestionsByEventId = async (eventId) => {
  const sql = `
    SELECT q.*, u.first_name || ' ' || u.last_name AS asker_name
    FROM questions q
    JOIN user u ON q.asked_by = u.user_id
    WHERE q.event_id = ?
    ORDER BY q.votes DESC // 按投票数排序
  `;
  return await executeSQL(sql, [eventId]);
};

// 3. 为问题投票（自增 1）
exports.voteQuestion = async (questionId) => {
  const sql = `
    UPDATE questions
    SET votes = votes + 1
    WHERE question_id = ?
  `;
  await executeSQL(sql, [questionId]);
  return true;
};