'use client';

import { useState, useCallback } from 'react';
import FamilyMemberForm from '@/components/FamilyMemberForm';
import FamilyDiagram from '@/components/FamilyDiagram';
import DiagnosisResultView from '@/components/DiagnosisResult';
import AgeGuideView from '@/components/AgeGuideView';
import AllRelationships from '@/components/AllRelationships';
import AIFeedback from '@/components/AIFeedback';
import ConcernSelector from '@/components/ConcernSelector';
import KurumiIcon from '@/components/KurumiIcon';
import { diagnoseSanmeigaku } from '@/lib/sanmeigaku';
import { diagnoseSeimei } from '@/lib/seimei';
import { COMPATIBILITY_MATRIX } from '@/data/compatibility-matrix';
import { CONCERNS, CONCERN_HINTS } from '@/data/concerns';
import type { FamilyMember, AppStep, RelationshipResult } from '@/lib/types';
import type { MainStar } from '@/lib/sanmeigaku';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';

function createId() {
  return Math.random().toString(36).slice(2, 9);
}

function createMember(role: FamilyMember['role'], roleLabel: string): FamilyMember {
  return { id: createId(), role, roleLabel, familyName: '', givenName: '', birthYear: 0, birthMonth: 0, birthDay: 0 };
}

// 二人のメンバー間の相性を取得
function getCompatibility(a: FamilyMember, b: FamilyMember): CompatibilityAdvice | null {
  if (!a.sanmeigaku || !b.sanmeigaku) return null;
  return COMPATIBILITY_MATRIX[a.sanmeigaku.mainStar as MainStar]?.[b.sanmeigaku.mainStar as MainStar] ?? null;
}

// 関係ラベルを生成
function getRelationLabel(a: FamilyMember, b: FamilyMember): string {
  return `${a.roleLabel} → ${b.roleLabel}`;
}

export default function Home() {
  const [step, setStep] = useState<AppStep>('input');
  const [members, setMembers] = useState<FamilyMember[]>([
    createMember('parent', 'ママ'),
    createMember('child', 'お子さん'),
  ]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [diagnosedMembers, setDiagnosedMembers] = useState<FamilyMember[]>([]);
  const [allRelationships, setAllRelationships] = useState<RelationshipResult[]>([]);
  const [selectedRelIdx, setSelectedRelIdx] = useState(0);
  const [selectedChildForAge, setSelectedChildForAge] = useState(0);
  const [resultTab, setResultTab] = useState<'overview' | 'age' | 'relations' | 'chat'>('overview');

  const parents = members.filter((m) => m.role === 'parent');
  const children = members.filter((m) => m.role === 'child');
  const grandparents = members.filter((m) => m.role === 'grandparent');

  const updateMember = useCallback((id: string, updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const addMember = (role: FamilyMember['role'], label: string) => {
    setMembers((prev) => [...prev, createMember(role, label)]);
  };

  const removeMember = (id: string, role: FamilyMember['role'], minCount: number) => {
    const count = members.filter((m) => m.role === role).length;
    if (count <= minCount) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const canDiagnose = () => {
    const hasParent = parents.some((p) => p.birthYear && p.birthMonth && p.birthDay);
    const hasChild = children.some((c) => c.birthYear && c.birthMonth && c.birthDay);
    return hasParent && hasChild;
  };

  const runDiagnosis = () => {
    // 全メンバーの算命学・姓名判断を実行
    const diagnosed = members.map((m) => {
      const result = { ...m };
      if (m.birthYear && m.birthMonth && m.birthDay) {
        result.sanmeigaku = diagnoseSanmeigaku(m.birthYear, m.birthMonth, m.birthDay);
      }
      if (m.familyName && m.givenName) {
        result.seimei = diagnoseSeimei(m.familyName, m.givenName);
      }
      return result;
    });
    setDiagnosedMembers(diagnosed);

    // 全方向の相性を計算
    const relationships: RelationshipResult[] = [];
    const withStar = diagnosed.filter((m) => m.sanmeigaku);

    for (let i = 0; i < withStar.length; i++) {
      for (let j = 0; j < withStar.length; j++) {
        if (i === j) continue;
        const a = withStar[i];
        const b = withStar[j];
        // 親→子、祖父母→子、子→子（きょうだい）の方向で出す
        // 同じペアの逆方向も出す（ママ→子 と 子→ママ は別の意味がある）
        const skipReverse =
          (a.role === 'child' && b.role === 'child' && relationships.some(r =>
            r.memberA.id === b.id && r.memberB.id === a.id));
        if (skipReverse) continue;

        const compat = getCompatibility(a, b);
        if (compat) {
          relationships.push({
            memberA: a, memberB: b,
            relationLabel: getRelationLabel(a, b),
            compatibility: compat,
          });
        }
      }
    }
    setAllRelationships(relationships);
    setSelectedRelIdx(0);
    setSelectedChildForAge(0);
    setResultTab('overview');
    setStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 結果画面用のデータ
  const diagnosedChildren = diagnosedMembers.filter((m) => m.role === 'child' && m.sanmeigaku);
  const firstParent = diagnosedMembers.find((m) => m.role === 'parent' && m.sanmeigaku);
  const firstChild = diagnosedChildren[selectedChildForAge];
  const currentRel = allRelationships[selectedRelIdx];

  // お悩みヒント
  const getConcernHints = (child: FamilyMember) => {
    if (!child.sanmeigaku) return [];
    const childStar = child.sanmeigaku.mainStar as MainStar;
    return selectedConcerns.map((concernId) => {
      const concern = CONCERNS.find((c) => c.id === concernId);
      const hint = CONCERN_HINTS[concernId]?.[childStar];
      return { concernLabel: concern?.label || '', hint: hint || '' };
    }).filter((h) => h.hint);
  };

  const tabs = [
    { id: 'overview' as const, label: '診断結果', icon: '📋' },
    { id: 'age' as const, label: '年齢別ガイド', icon: '📅' },
    { id: 'relations' as const, label: '全員の相性', icon: '🔗' },
    { id: 'chat' as const, label: 'くるみ先生', icon: '🐿️' },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* ============ 入力画面 ============ */}
      {step === 'input' && (
        <>
          {/* ヒーローセクション */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF3E4 0%, #FFE8D6 40%, #FFCCBC 100%)' }}>
            <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-[#FF8C6B] opacity-30" />
            <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-[#FFB74D] opacity-40" />
            <div className="absolute bottom-12 left-16 w-2 h-2 rounded-full bg-[#81C784] opacity-30" />
            <div className="max-w-lg mx-auto px-5 pt-12 pb-8">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold tracking-wider" style={{ color: '#8D6E63' }}>FAMILY COMPASS</p>
                  <h1 className="text-2xl font-extrabold mt-2 leading-tight" style={{ color: '#3E2723' }}>
                    あなたの家族だけの<br />
                    <span style={{ color: '#FF7043' }}>トリセツ</span>を作ろう
                  </h1>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: '#5D4037' }}>
                    生年月日と名前から、お子さんの個性と<br />
                    最適な関わり方を診断します
                  </p>
                </div>
                <div className="animate-float shrink-0">
                  <KurumiIcon size={88} />
                </div>
              </div>
            </div>
            <svg viewBox="0 0 400 30" className="w-full block" preserveAspectRatio="none" style={{ height: '24px' }}>
              <path d="M0 30 C100 0, 300 0, 400 30 L400 30 L0 30 Z" fill="#FFFBF5" />
            </svg>
          </div>

          <main className="max-w-lg mx-auto px-5 pb-10 space-y-8">
            {/* ステップ1: 家族を登録 */}
            <section className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#FF7043' }}>1</div>
                <h2 className="font-bold text-lg" style={{ color: '#3E2723' }}>家族を教えてね</h2>
              </div>

              <div className="flex items-start gap-2 mb-5">
                <KurumiIcon size={36} />
                <div className="relative rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed" style={{ background: '#FFF3E4', color: '#5D4037' }}>
                  まずはご家族のお名前と生年月日を入力してくださいね。名前はひらがなでもOKですよ！
                  <div className="absolute -left-1.5 top-2.5 w-3 h-3 rotate-45" style={{ background: '#FFF3E4' }} />
                </div>
              </div>

              <FamilyDiagram members={members} />

              {/* 保護者 */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold tracking-wider" style={{ color: '#8D6E63' }}>保護者</p>
                {parents.map((p) => (
                  <FamilyMemberForm key={p.id} member={p}
                    onChange={(m) => updateMember(p.id, m)}
                    onRemove={() => removeMember(p.id, 'parent', 1)}
                    canRemove={parents.length > 1} />
                ))}
                {parents.length < 2 && (
                  <button onClick={() => addMember('parent', '保護者2')}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01]"
                    style={{ borderColor: '#D7CCC8', color: '#8D6E63', background: 'rgba(141,110,99,0.03)' }}>
                    + 保護者を追加する
                  </button>
                )}
              </div>

              {/* お子さん */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold tracking-wider" style={{ color: '#8D6E63' }}>お子さん</p>
                {children.map((c) => (
                  <FamilyMemberForm key={c.id} member={c}
                    onChange={(m) => updateMember(c.id, m)}
                    onRemove={() => removeMember(c.id, 'child', 1)}
                    canRemove={children.length > 1} />
                ))}
                <button onClick={() => { const n = children.length; addMember('child', n === 0 ? 'お子さん' : `${n + 1}人目`); }}
                  className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{ borderColor: '#FFAB91', color: '#FF7043', background: 'rgba(255,140,107,0.05)' }}>
                  + お子さんを追加する
                </button>
              </div>

              {/* 祖父母 */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold tracking-wider" style={{ color: '#8D6E63' }}>祖父母</p>
                {grandparents.map((g) => (
                  <FamilyMemberForm key={g.id} member={g}
                    onChange={(m) => updateMember(g.id, m)}
                    onRemove={() => removeMember(g.id, 'grandparent', 0)}
                    canRemove={true} />
                ))}
                <button onClick={() => addMember('grandparent', grandparents.length === 0 ? 'おばあちゃん' : 'おじいちゃん')}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{ borderColor: '#D7CCC8', color: '#8D6E63', background: 'rgba(141,110,99,0.03)' }}>
                  + 祖父母を追加する
                </button>
              </div>

              {/* 先生の補足 */}
              <div className="mt-4 rounded-2xl p-4" style={{ background: '#F3E5F5', border: '1px solid #CE93D8' }}>
                <p className="text-xs font-bold" style={{ color: '#7B1FA2' }}>💡 ヒント</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6A1B9A' }}>
                  担任の先生や保育士さんの生年月日がわかれば、「保護者」として追加することで先生との相性も診断できます。
                  呼び名を「〇〇先生」にするとわかりやすいですよ。
                </p>
              </div>
            </section>

            {/* ステップ2: お悩み選択 */}
            <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#FFB74D' }}>2</div>
                <h2 className="font-bold text-lg" style={{ color: '#3E2723' }}>気になることはある？</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F5E9', color: '#4CAF50' }}>任意</span>
              </div>
              <ConcernSelector selected={selectedConcerns} onChange={setSelectedConcerns} />
            </section>

            {/* 診断ボタン */}
            <section className="pt-2">
              <button onClick={runDiagnosis} disabled={!canDiagnose()}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: canDiagnose() ? 'linear-gradient(135deg, #FF7043, #FF8C6B)' : '#D7CCC8' }}>
                家族のトリセツを作る
              </button>
              {!canDiagnose() && (
                <p className="text-xs text-center mt-2" style={{ color: '#BCAAA4' }}>保護者とお子さんの生年月日を入力してください</p>
              )}
            </section>
          </main>
        </>
      )}

      {/* ============ 結果画面 ============ */}
      {step === 'result' && (
        <>
          {/* 結果ヘッダー */}
          <div style={{ background: 'linear-gradient(135deg, #FFF3E4 0%, #FFE8D6 50%, #E8F5E9 100%)' }}>
            <div className="max-w-lg mx-auto px-5 pt-8 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <KurumiIcon size={44} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#8D6E63' }}>FAMILY COMPASS</p>
                  <h1 className="text-xl font-extrabold" style={{ color: '#3E2723' }}>あなたの家族のトリセツ</h1>
                </div>
              </div>
            </div>
            <div className="max-w-lg mx-auto px-5 pb-4">
              <FamilyDiagram members={diagnosedMembers}
                selectedPairIds={currentRel ? [currentRel.memberA.id, currentRel.memberB.id] : undefined} />
            </div>
            <svg viewBox="0 0 400 30" className="w-full block" preserveAspectRatio="none" style={{ height: '24px' }}>
              <path d="M0 30 C100 0, 300 0, 400 30 L400 30 L0 30 Z" fill="#FFFBF5" />
            </svg>
          </div>

          {/* タブ切り替え */}
          <div className="sticky top-0 z-40 bg-[#FFFBF5] border-b" style={{ borderColor: '#FFE0B2' }}>
            <div className="max-w-lg mx-auto px-5 flex gap-1 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setResultTab(tab.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    background: resultTab === tab.id ? '#FF7043' : 'transparent',
                    color: resultTab === tab.id ? 'white' : '#8D6E63',
                  }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <main className="max-w-lg mx-auto px-5 pb-10 space-y-6 mt-4">
            {/* === タブ: 診断結果 === */}
            {resultTab === 'overview' && firstParent && firstChild && (
              <>
                {/* 子供選択（複数の場合） */}
                {diagnosedChildren.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {diagnosedChildren.map((c, i) => (
                      <button key={c.id} onClick={() => setSelectedChildForAge(i)}
                        className="shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
                        style={{
                          background: selectedChildForAge === i ? '#81C784' : '#E8F5E9',
                          color: selectedChildForAge === i ? 'white' : '#2E7D32',
                        }}>
                        {c.roleLabel}
                      </button>
                    ))}
                  </div>
                )}

                <DiagnosisResultView
                  parent={firstParent} child={firstChild}
                  compatibility={getCompatibility(firstParent, firstChild)!}
                  concernHints={getConcernHints(firstChild)} />
              </>
            )}

            {/* === タブ: 年齢別ガイド === */}
            {resultTab === 'age' && (
              <>
                {diagnosedChildren.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {diagnosedChildren.map((c, i) => (
                      <button key={c.id} onClick={() => setSelectedChildForAge(i)}
                        className="shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
                        style={{
                          background: selectedChildForAge === i ? '#81C784' : '#E8F5E9',
                          color: selectedChildForAge === i ? 'white' : '#2E7D32',
                        }}>
                        {c.roleLabel}
                      </button>
                    ))}
                  </div>
                )}
                {firstChild && <AgeGuideView child={firstChild} />}
              </>
            )}

            {/* === タブ: 全員の相性 === */}
            {resultTab === 'relations' && (
              <AllRelationships
                relationships={allRelationships}
                selectedIdx={selectedRelIdx}
                onSelect={setSelectedRelIdx} />
            )}

            {/* === タブ: くるみ先生 === */}
            {resultTab === 'chat' && firstParent && firstChild && (
              <AIFeedback
                parent={firstParent} child={firstChild}
                compatibility={getCompatibility(firstParent, firstChild)!}
                concernHints={getConcernHints(firstChild)} />
            )}

            {/* 戻るボタン */}
            <button onClick={() => { setStep('input'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full py-3 rounded-2xl border-2 font-bold transition-all hover:scale-[1.01]"
              style={{ borderColor: '#D7CCC8', color: '#8D6E63', background: 'white' }}>
              もう一度やり直す
            </button>
          </main>
        </>
      )}

      <footer className="text-center py-8 text-xs" style={{ color: '#BCAAA4' }}>
        <p>Family Compass &mdash; 算命学 &times; 姓名判断で家族の絆を深める</p>
        <p className="mt-1">※ 本診断はエンターテインメントを目的としています</p>
      </footer>
    </div>
  );
}
