import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import type { AddressInfo } from 'node:net';

async function withServer(ai: ((messages: unknown[]) => Promise<unknown>) | undefined, fn: (base: string) => Promise<void>) {
  const server = createApp({ ai, allowedOrigins: ['https://example.com'] }).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try { await fn(`http://127.0.0.1:${(server.address() as AddressInfo).port}`); }
  finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
}
const post = (base: string, route: string, body: unknown) => fetch(`${base}/api/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const worksheetId = 'hy-g3-chinese-u1-a';
test('未配置AI时健康检查明确关闭，评分仍可工作，识别返回503', async () => {
  await withServer(undefined, async base => {
    assert.equal((await (await fetch(`${base}/api/health`)).json()).ai, false);
    const grade = await post(base, 'grade', { worksheetId, answers: { q1: '早晨', q7: '小树像人一样' } });
    assert.equal(grade.status, 200);
    const data = await grade.json();
    assert.equal(data.grades[0].score, 10);
    assert.equal(data.grades[6].score, null);
    assert.equal((await post(base, 'recognize', { worksheetId, image: 'x' })).status, 503);
  });
});
test('拒绝未知作业、非字符串答案和不允许的来源', async () => {
  await withServer(undefined, async base => {
    assert.equal((await post(base, 'grade', { worksheetId: 'missing', answers: {} })).status, 400);
    assert.equal((await post(base, 'grade', { worksheetId, answers: { q1: 12 } })).status, 400);
    assert.equal((await post(base, 'grade', { worksheetId, answers: { unexpected: 'x' } })).status, 400);
    assert.equal((await fetch(`${base}/api/health`, { headers: { Origin: 'https://bad.example' } })).status, 403);
  });
});
test('AI识别仅接受图片并校验返回题号', async () => {
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
  await withServer(async () => ({ answers: { q1: '早晨' } }), async base => {
    assert.equal((await post(base, 'recognize', { worksheetId, image: 'data:text/html;base64,abc' })).status, 400);
    const response = await post(base, 'recognize', { worksheetId, image });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).answers.q1, '早晨');
  });
  await withServer(async () => ({ answers: { q999: '虚构' } }), async base => {
    assert.equal((await post(base, 'recognize', { worksheetId, image })).status, 502);
  });
});
test('AI评分按服务端采分点验证，客观分数不能被模型覆盖', async () => {
  await withServer(async () => ({ grades: [{ id: 'q7', score: 12, feedback: '指出表达，但效果说明不足。' }] }), async base => {
    const response = await post(base, 'grade', { worksheetId, answers: { q1: '错误', q7: '树像人' } });
    const { grades } = await response.json();
    assert.equal(response.status, 200);
    assert.equal(grades[0].score, 0);
    assert.equal(grades[6].score, 12);
    assert.equal(grades[6].review, true);
  });
  await withServer(async () => ({ grades: [{ id: 'q7', score: 500, feedback: '满分' }] }), async base => {
    assert.equal((await post(base, 'grade', { worksheetId, answers: { q7: '树像人' } })).status, 502);
  });
});
