// 共通型定義

import type { SanmeigakuResult } from './sanmeigaku';
import type { SeimeiResult } from './seimei';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';

export type FamilyRole = 'parent' | 'child' | 'grandparent';

export interface FamilyMember {
  id: string;
  role: FamilyRole;
  roleLabel: string;  // 表示用（例: 「ママ」「長女」「おばあちゃん」）
  familyName: string;
  givenName: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  sanmeigaku?: SanmeigakuResult;
  seimei?: SeimeiResult;
}

// 二人の関係性の診断結果
export interface RelationshipResult {
  memberA: FamilyMember;
  memberB: FamilyMember;
  relationLabel: string;       // 例: 「ママ → 長女」「長女 ↔ 次男」
  compatibility: CompatibilityAdvice;
}

export interface DiagnosisResult {
  parent: FamilyMember;
  child: FamilyMember;
  compatibility: CompatibilityAdvice;
  concernHints: { concernLabel: string; hint: string }[];
}

export type AppStep = 'input' | 'result' | 'ai-feedback';
