export interface CatalogNode { id: string; label: string; kind: 'region' | 'grade' | 'subject' | 'book' | 'unit' | 'worksheet'; children?: CatalogNode[]; worksheetId?: string }
export interface Question { id: string; kind: 'choice' | 'fill' | 'short'; prompt: string; points: number; knowledge: string; options?: string[]; accepted?: string[]; reference: string; rubric: string }
export interface Worksheet { id: string; title: string; subtitle: string; minutes: number; questions: Question[] }
export type Answers = Record<string, string>;
export interface Grade { id: string; score: number | null; feedback: string; review: boolean; source: 'rule' | 'ai' | 'pending' | 'manual' }
export interface AIGrade { id: string; score: number; feedback: string }
