import { useEffect, useState } from 'react';
import { catalog, worksheets } from '../shared/catalog';
import { gradeWorksheet } from '../shared/grading';
import type { Answers, CatalogNode, Grade, Worksheet } from '../shared/types';
import { loadWork, saveWork } from './storage';
import { request } from './api';
import Tree from './Tree';

function findPath(nodes: CatalogNode[], id: string): string[] {
  for (const node of nodes) {
    if (node.worksheetId === id) return [node.label];
    const child = findPath(node.children ?? [], id);
    if (child.length) return [node.label, ...child];
  }
  return [];
}
function printPage(mode: 'blank' | 'result') {
  document.documentElement.dataset.print = mode;
  window.print();
  delete document.documentElement.dataset.print;
}

export default function App() {
  const [selected, setSelected] = useState(worksheets[0].id);
  const [ready, setReady] = useState(false);
  const path = findPath(catalog, selected);
  useEffect(() => { request<{ ai: boolean }>('health').then(r => setReady(r.ai)).catch(() => setReady(false)); }, []);
  return <div className="shell"><aside className="sidebar"><a className="brand" href="#"><span className="brand-icon">雁</span><span>雁城作业本<small>HENGYANG · LEARNING</small></span></a><div className="side-label">我的学习目录</div><nav aria-label="教材树状目录"><Tree nodes={catalog} selected={selected} onSelect={setSelected} /></nav><div className="side-note"><span className="dot" /> 衡阳示范站<p>从一个单元开始，<br/>让每一次练习都有收获。</p><small>目录支持扩展年级、学科与单元</small></div></aside><main><header className="topbar"><span>{path.slice(0, 3).join(' / ')}</span><span className="status">{ready ? '● AI 服务已配置' : '○ 本地练习模式'}</span></header><Workspace key={selected} worksheet={worksheets.find(w => w.id === selected)!} aiReady={ready} path={path} /><footer>雁城作业本 · 原创教学示范，非官方试卷。教材版本与进度请以学校实际使用为准。<br/>学习记录仅保存在本机浏览器；照片不会保存到学习记录。</footer></main></div>;
}

function Workspace({ worksheet: w, aiReady, path }: { worksheet: Worksheet; aiReady: boolean; path: string[] }) {
  const [saved] = useState(() => loadWork(w.id));
  const [answers, setAnswers] = useState<Answers>(saved.answers);
  const [grades, setGrades] = useState<Grade[]>(saved.grades);
  const [mistakes, setMistakes] = useState<string[]>(saved.mistakes);
  const [mode, setMode] = useState<'online' | 'photo'>('online');
  const [view, setView] = useState<'work' | 'result' | 'mistakes'>('work');
  const [photo, setPhoto] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [storageOK, setStorageOK] = useState(true);
  const completed = w.questions.filter(q => answers[q.id]?.trim()).length;
  const maximum = w.questions.reduce((sum, q) => sum + q.points, 0);
  useEffect(() => { setStorageOK(saveWork(w.id, { answers, grades, mistakes })); }, [answers, grades, mistakes, w.id]);
  function changeAnswer(id: string, value: string) { setAnswers(a => ({ ...a, [id]: value })); setGrades([]); setConfirmed(false); }
  function remember(next: Grade[]) {
    setGrades(next);
    setMistakes(old => Array.from(new Set([...old, ...next.filter(g => g.score !== null && g.score < w.questions.find(q => q.id === g.id)!.points).map(g => g.id)])));
  }
  async function submit() {
    setBusy(true); setMessage('');
    let result = gradeWorksheet(w, answers);
    if (aiReady) {
      try { result = (await request<{ grades: Grade[] }>('grade', { worksheetId: w.id, answers })).grades; }
      catch (error) { setMessage(`${(error as Error).message} 已完成规则批改，非空主观题等待人工复核。`); }
    }
    remember(result); setView('result'); setBusy(false);
  }
  async function readPhoto(file?: File) {
    setMessage(''); setConfirmed(false); setPhoto('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setMessage('请选择不超过 8MB 的 JPG、PNG 或 WebP 图片。'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.onerror = () => setMessage('图片读取失败，请重新选择。');
    reader.readAsDataURL(file);
  }
  async function recognize() {
    setBusy(true); setMessage('');
    try { const data = await request<{ answers: Answers }>('recognize', { worksheetId: w.id, image: photo }); setAnswers(data.answers); setGrades([]); setConfirmed(false); setMessage('识别完成。请逐题对照照片检查，空白表示未识别到答案。'); }
    catch (error) { setMessage(`${(error as Error).message} 你仍可对照照片手动录入答案。`); }
    finally { setBusy(false); }
  }
  const total = grades.reduce((sum, g) => sum + (g.score ?? 0), 0);
  const pending = grades.filter(g => g.review).length;
  const visible = view === 'mistakes' ? w.questions.filter(q => mistakes.includes(q.id)) : w.questions;
  return <div className="workspace"><section className="hero"><div><div className="eyebrow">每一点进步，都值得被看见</div><h1>今天，也向前一步。</h1><p>认真作答，发现问题，把知识一点点学扎实。</p><div className="tags">{[path[0], path[2], path[4]].map(label => <span key={label}>{label}</span>)}</div></div><div className="hero-art" aria-hidden="true"><span>{path[2]?.slice(0, 1) || '学'}</span><i>练习 · 思考 · 成长</i></div></section>
    <div className="section-heading"><div><h2>{w.title}</h2><p>{w.subtitle}</p></div><button className="secondary" onClick={() => printPage('blank')}>打印空白作业</button></div>
    <div className="tabs" role="tablist" aria-label="学习视图">{[['work', '作业练习'], ['result', '批改结果'], ['mistakes', `错题本 · ${mistakes.length}`]].map(([key, label]) => <button key={key} role="tab" aria-selected={view === key} onClick={() => setView(key as typeof view)}>{label}</button>)}</div>
    {!storageOK && <div className="notice" role="alert">浏览器无法保存进度，请完成后打印结果或记录分数。</div>}
    {message && <div className="notice" role="status">{message}</div>}
    {view === 'work' && <><div className="mode-grid"><button className={`mode-card ${mode === 'online' ? 'active' : ''}`} onClick={() => { setMode('online'); setConfirmed(false); }}><b>01　在线答题</b><span>直接填写答案，提交后查看解析</span></button><button className={`mode-card ${mode === 'photo' ? 'active' : ''}`} onClick={() => { setMode('photo'); setConfirmed(false); }}><b>02　拍照批改</b><span>上传本份作业，核对识别内容后批改</span></button></div>
      {mode === 'photo' && <section className="photo-panel"><h3>上传作业 → 核对答案 → 提交批改</h3><p>仅支持当前这份作业，请保留题号、保证字迹清晰。可先打印空白作业。</p><label className="upload">选择作业照片<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => readPhoto(e.target.files?.[0])} /></label>{photo && <img className="photo-preview" src={photo} alt="待批改的作业照片" />}<p className="muted">{aiReady ? '点击识别时，图片将发送到配置的 AI 服务。请核对识别结果后再提交。' : '未配置 AI：支持照片预览，请在下方逐题手动录入答案。'}</p><button disabled={!photo || !aiReady || busy} onClick={recognize}>{busy ? '处理中…' : '识别照片中的答案'}</button></section>}
      <div className="progress-row"><span>已作答 <b>{completed}</b> / {w.questions.length} 题</span><span>满分 {maximum} 分 · 建议 {w.minutes} 分钟</span></div><progress value={completed} max={w.questions.length} />
      <div className="questions">{w.questions.map((q, index) => <article className="question" key={q.id}><div className="question-top"><span className="number">{String(index + 1).padStart(2, '0')}</span><span className="knowledge">{q.knowledge}</span><span className="points">{q.points} 分</span></div><h3 id={`prompt-${q.id}`}>{q.prompt}</h3>{q.kind === 'choice' ? <div role="group" aria-labelledby={`prompt-${q.id}`} className="options">{q.options!.map(option => <label className={answers[q.id] === option[0] ? 'chosen' : ''} key={option}><input type="radio" name={q.id} checked={answers[q.id] === option[0]} disabled={busy} onChange={() => changeAnswer(q.id, option[0])} />{option}</label>)}</div> : <textarea aria-labelledby={`prompt-${q.id}`} rows={q.kind === 'short' ? 4 : 1} placeholder={q.kind === 'short' ? '写下你的想法，意思清楚最重要…' : '请输入答案'} maxLength={4000} value={answers[q.id] ?? ''} disabled={busy} onChange={e => changeAnswer(q.id, e.target.value)} />}</article>)}</div>
      {mode === 'photo' && <label className="confirmation"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />我已逐题核对照片，确认下方答案与作业一致。</label>}
      <div className="submit-bar"><div><b>{storageOK ? '进度已自动保存在本机' : '进度未保存'}</b><small>未作答题按 0 分计；主观题支持家长复核。</small></div><button disabled={busy || completed === 0 || (mode === 'photo' && (!photo || !confirmed))} onClick={submit}>{busy ? '正在批改…' : '提交批改 →'}</button></div></>}
    {view === 'result' && (grades.length ? <>
      <section className="result-banner">
        <div><small>{pending ? '当前建议得分 · 待复核' : '本次练习得分'}</small><strong>{total}<em> / {maximum}</em></strong></div>
        <div><h2>{pending ? `${pending} 道题需要家长或老师复核` : '每次订正，都是一次进步'}</h2><p>未评分题暂不计入得分；AI 建议分不等于最终成绩。</p><button className="secondary" onClick={() => printPage('result')}>打印批改结果</button></div>
      </section>
      {w.questions.map((q, i) => {
        const g = grades.find(g => g.id === q.id);
        if (!g) return null;
        return <article className="question" key={q.id}>
          <div className="question-top"><span className="number">{i + 1}</span><span className="knowledge">{q.knowledge}</span><b className={g.review ? 'review' : 'score'}>{g.score === null ? '待评分' : `${g.score} / ${q.points} 分`}{g.source === 'ai' ? ' · AI 建议' : ''}</b></div>
          <h3>{q.prompt}</h3><p className="answer-text">你的答案：{answers[q.id] || '未作答'}</p><p>{g.feedback}</p>
          <div className="explanation"><b>参考答案与采分点</b><p>{q.reference}</p><small>{q.rubric}</small></div>
          {q.kind === 'short' && <form className="manual" onSubmit={e => {
            e.preventDefault();
            const score = Number(new FormData(e.currentTarget).get('score'));
            if (!Number.isFinite(score) || score < 0 || score > q.points) return;
            remember(grades.map(row => row.id === q.id ? { ...row, score, review: false, source: 'manual', feedback: '已按采分点人工复核。' } : row));
          }}><label>人工复核得分 <input aria-label={`第${i + 1}题人工得分`} name="score" type="number" min="0" max={q.points} step="0.5" required defaultValue={g.score ?? ''} /></label><button className="secondary" type="submit">确认复核</button></form>}
        </article>;
      })}
    </> : <section className="empty"><h2>还没有批改结果</h2><p>完成作业后提交，来这里发现你的进步。</p><button onClick={() => setView('work')}>开始练习</button></section>)}
    {view === 'mistakes' && <><div className="section-heading"><p>保留历次失分题，掌握后可以手动移出。</p>{mistakes.length > 0 && <button onClick={() => { setAnswers(old => Object.fromEntries(Object.entries(old).filter(([id]) => !mistakes.includes(id)))); setGrades([]); setView('work'); setMode('online'); setMessage('已清空错题答案，其他答案保留。请重新完成后提交。'); }}>重新练习错题</button>}</div>{visible.length ? visible.map(q => <article className="question" key={q.id}><span className="knowledge">{q.knowledge}</span><h3>{q.prompt}</h3><p>{q.reference}</p><small>{q.rubric}</small><div><button className="secondary" onClick={() => setMistakes(old => old.filter(id => id !== q.id))}>我已掌握，移出错题本</button></div></article>) : <section className="empty"><h2>错题本还是空的</h2><p>提交后，已判定的失分题会自动收录在这里。</p></section>}</>}
    <section className="print-sheet"><h1>{w.title}</h1><p>姓名：________　日期：________　满分：{maximum} 分</p>{w.questions.map((q, i) => <article key={q.id}><h3>{i + 1}. {q.prompt}（{q.points}分）</h3>{q.options?.map(o => <p key={o}>{o}</p>)}<div className={q.kind === 'short' ? 'print-lines large' : 'print-lines'} /></article>)}</section>
  </div>;
}
