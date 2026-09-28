import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeWorksheet, validateAIGrades } from '../shared/grading.js';
import { worksheets, catalog } from '../shared/catalog.js';

test('示范作业100分且有可扩展目录', () => {
  assert.equal(worksheets[0].questions.reduce((n, q) => n + q.points, 0), 100);
  assert.ok(catalog[0].children?.length);
});
test('归一化全角空格，错误答案不误给分，空主观题直接零分', () => {
  const result = gradeWorksheet(worksheets[0], { q1: ' 早晨　', q2: '错误', q7: '' });
  assert.equal(result[0].score, 10);
  assert.equal(result[1].score, 0);
  assert.equal(result.find(r => r.id === 'q7')?.score, 0);
});
test('非空主观题没有模型评分时不得伪造分数', () => {
  const result = gradeWorksheet(worksheets[0], { q7: '用手臂和跳舞描写树枝，很生动。' });
  assert.equal(result.find(r => r.id === 'q7')?.score, null);
  assert.equal(result.find(r => r.id === 'q7')?.review, true);
});
test('拒绝超出满分、重复题号、缺题和非数值AI评分', () => {
  const qs = worksheets[0].questions.filter(q => q.kind === 'short');
  for (const data of [[{ id: 'q7', score: 999, feedback: '好' }], [], [{ id: 'q7', score: '5', feedback: '好' }]]) {
    assert.throws(() => validateAIGrades(data, qs));
  }
  const valid = qs.map(q => ({ id: q.id, score: q.points / 2, feedback: '缺少一个采分点' }));
  assert.equal(validateAIGrades(valid, qs).length, qs.length);
  assert.throws(() => validateAIGrades([...valid, valid[0]], qs));
});
