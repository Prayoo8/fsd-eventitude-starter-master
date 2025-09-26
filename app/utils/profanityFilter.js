const Filter = require('bad-words');  // 使用 CommonJS 导入
const profanityFilter = new Filter();

// 扩展敏感词库（补充作业场景可能涉及的词汇）
profanityFilter.addWords('垃圾', '愚蠢', 'fuck', 'shit');

// 过滤文本中的敏感词
exports.filterText = (text) => {
  if (!text) return '';
  return profanityFilter.clean(text);
};

// 检查文本是否包含敏感词（返回布尔值）
exports.hasProfanity = (text) => {
  if (!text) return false;
  return profanityFilter.isProfane(text);
};