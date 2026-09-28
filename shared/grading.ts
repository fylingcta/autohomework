import type { AIGrade, Answers, Grade, Question, Worksheet } from './types.js';
const normalize = (value: string) => value.normalize('NFKC').trim();
export function validateAIGrades(value: unknown, questions: Question[]): AIGrade[] {
  if (!Array.isArray(value) || value.length !== questions.length) throw new Error('模型返回的评分题数不匹配');
  const seen = new Set<string>();
  return value.map(item => {
    const q = questions.find(q => q.id === item?.id);
    if (!q || seen.has(item.id) || typeof item.score !== 'number' || !Number.isFinite(item.score) || item.score < 0 || item.score > q.points || typeof item.feedback !== 'string' || !item.feedback.trim() || item.feedback.length > 3000) throw new Error('模型评分格式或分值无效');
    seen.add(item.id);
    return { id: item.id, score: item.score, feedback: item.feedback };
  });
}
export function gradeWorksheet(worksheet: Worksheet, answers: Answers, ai: AIGrade[] = []): Grade[] {
  return worksheet.questions.map(q => {
    const answer = normalize(answers[q.id] ?? '');
    if (!answer) return { id: q.id, score: 0, feedback: '本题未作答。', review: false, source: 'rule' };
    if (q.kind !== 'short') {
      const correct = q.accepted?.some(a => normalize(a) === answer);
      return { id: q.id, score: correct ? q.points : 0, feedback: correct ? '回答正确。' : '请对照参考答案，回顾这个知识点。', review: false, source: 'rule' };
    }
    const grade = ai.find(item => item.id === q.id);
    return grade ? { ...grade, review: true, source: 'ai' } : { id: q.id, score: null, feedback: '等待家长或老师按采分点复核；连接 AI 服务后可获取建议分。', review: true, source: 'pending' };
  });
}
