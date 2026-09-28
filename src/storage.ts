import type { Answers, Grade } from '../shared/types';
export interface SavedWork { answers: Answers; grades: Grade[]; mistakes: string[] }
export function loadWork(id: string): SavedWork {
  const empty = { answers: {}, grades: [], mistakes: [] };
  try {
    const value = JSON.parse(localStorage.getItem(`homework:v1:${id}`) || 'null');
    if (!value || typeof value.answers !== 'object' || !value.answers || !Object.values(value.answers).every(a => typeof a === 'string') || !Array.isArray(value.grades) || !value.grades.every((g: Grade) => g && typeof g.id === 'string' && (g.score === null || typeof g.score === 'number') && typeof g.feedback === 'string') || !Array.isArray(value.mistakes) || !value.mistakes.every((s: unknown) => typeof s === 'string')) return empty;
    return value;
  } catch { return empty; }
}
export function saveWork(id: string, work: SavedWork): boolean {
  try { localStorage.setItem(`homework:v1:${id}`, JSON.stringify(work)); return true; } catch { return false; }
}
