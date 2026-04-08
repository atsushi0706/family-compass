// 共通型定義

import type { SanmeigakuResult } from './sanmeigaku';
import type { SeimeiResult } from './seimei';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';

export type FamilyRole = 'parent1' | 'parent2' | 'child';

export interface FamilyMember {
  id: string;
  role: FamilyRole;
  roleLabel: string;  // 表示用（例: 「ママ」「パパ」「長男」）
  familyName: string;
  givenName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  sanmeigaku?: SanmeigakuResult;
  seimei?: SeimeiResult;
}

export interface DiagnosisResult {
  parent: FamilyMember;
  child: FamilyMember;
  compatibility: CompatibilityAdvice;
  concernHints: { concernLabel: string; hint: string }[];
}

export type AppStep = 'input' | 'result' | 'ai-feedback';
