'use client';

import { useState, useCallback } from 'react';
import FamilyMemberForm from '@/components/FamilyMemberForm';
import FamilyDiagram from '@/components/FamilyDiagram';
import DiagnosisResultView from '@/components/DiagnosisResult';
import AIFeedback from '@/components/AIFeedback';
import ConcernSelector from '@/components/ConcernSelector';
import KurumiIcon from '@/components/KurumiIcon';
import { diagnoseSanmeigaku } from '@/lib/sanmeigaku';
import { diagnoseSeimei } from '@/lib/seimei';
import { COMPATIBILITY_MATRIX } from '@/data/compatibility-matrix';
import { CONCERNS, CONCERN_HINTS } from '@/data/concerns';
import type { FamilyMember, AppStep } from '@/lib/types';
import type { MainStar } from '@/lib/sanmeigaku';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';

function createId() {
  return Math.random().toString(36).slice(2, 9);
}

function createMember(role: FamilyMember['role'], roleLabel: string): FamilyMember {
  return {
    id: createId(), role, roleLabel,
    familyName: '', givenName: '',
    birthYear: 0, birthMonth: 0, birthDay: 0,
  };
}

export default function Home() {
  const [step, setStep] = useState<AppStep>('input');
  const [members, setMembers] = useState<FamilyMember[]>([
    createMember('parent1', 'ママ'),
    createMember('child', 'お子さん'),
  ]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedParentIdx, setSelectedParentIdx] = useState(0);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [diagnosedMembers, setDiagnosedMembers] = useState<FamilyMember[]>([]);
  const [currentCompatibility, setCurrentCompatibility] = useState<CompatibilityAdvice | null>(null);
  const [currentConcernHints, setCurrentConcernHints] = useState<{ concernLabel: string; hint: string }[]>([]);

  const parents = members.filter((m) => m.role === 'parent1' || m.role === 'parent2');
  const children = members.filter((m) => m.role === 'child');

  const updateMember = useCallback((id: string, updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const addParent = () => {
    if (parents.length >= 2) return;
    setMembers((prev) => [...prev, createMember('parent2', '保護者2')]);
  };

  const removeParent = (id: string) => {
    if (parents.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addChild = () => {
    const childCount = children.length;
    const labels = ['お子さん', '2人目', '3人目', '4人目', '5人目'];
    setMembers((prev) => [...prev, createMember('child', labels[childCount] || `${childCount + 1}人目`)]);
  };

  const removeChild = (id: string) => {
    if (children.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const canDiagnose = () => {
    const hasParent = parents.some((p) => p.birthYear && p.birthMonth && p.birthDay);
    const hasChild = children.some((c) => c.birthYear && c.birthMonth && c.birthDay);
    return hasParent && hasChild;
  };

  const runDiagnosis = () => {
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
    const vp = diagnosed.filter((m) => (m.role === 'parent1' || m.role === 'parent2') && m.sanmeigaku);
    const vc = diagnosed.filter((m) => m.role === 'child' && m.sanmeigaku);
    if (vp.length > 0 && vc.length > 0) {
      setSelectedParentIdx(0);
      setSelectedChildIdx(0);
      computeCompatibility(vp[0], vc[0]);
    }
    setStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const computeCompatibility = (parent: FamilyMember, child: FamilyMember) => {
    if (!parent.sanmeigaku || !child.sanmeigaku) return;
    const parentStar = parent.sanmeigaku.mainStar as MainStar;
    const childStar = child.sanmeigaku.mainStar as MainStar;
    const compat = COMPATIBILITY_MATRIX[parentStar]?.[childStar];
    if (compat) setCurrentCompatibility(compat);
    const hints = selectedConcerns.map((concernId) => {
      const concern = CONCERNS.find((c) => c.id === concernId);
      const hint = CONCERN_HINTS[concernId]?.[childStar];
      return { concernLabel: concern?.label || '', hint: hint || '' };
    }).filter((h) => h.hint);
    setCurrentConcernHints(hints);
  };

  const handlePairChange = (parentIdx: number, childIdx: number) => {
    setSelectedParentIdx(parentIdx);
    setSelectedChildIdx(childIdx);
    const vp = diagnosedMembers.filter((m) => (m.role === 'parent1' || m.role === 'parent2') && m.sanmeigaku);
    const vc = diagnosedMembers.filter((m) => m.role === 'child' && m.sanmeigaku);
    if (vp[parentIdx] && vc[childIdx]) computeCompatibility(vp[parentIdx], vc[childIdx]);
  };

  const validParents = diagnosedMembers.filter((m) => (m.role === 'parent1' || m.role === 'parent2') && m.sanmeigaku);
  const validChildren = diagnosedMembers.filter((m) => m.role === 'child' && m.sanmeigaku);
  const currentParent = validParents[selectedParentIdx];
  const currentChild = validChildren[selectedChildIdx];

  return (
    <div className="min-h-screen bg-paper">
      {/* ============ 入力画面 ============ */}
      {step === 'input' && (
        <>
          {/* ヒーローセクション */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF3E4 0%, #FFE8D6 40%, #FFCCBC 100%)' }}>
            {/* 装飾ドット */}
            <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-[#FF8C6B] opacity-30" />
            <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-[#FFB74D] opacity-40" />
            <div className="absolute bottom-12 left-16 w-2 h-2 rounded-full bg-[#81C784] opacity-30" />
            <div className="absolute top-24 right-24 w-4 h-4 rounded-full bg-[#FF8C6B] opacity-15" />

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

            {/* 波型の区切り */}
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

              {/* くるみ先生の吹き出し */}
              <div className="flex items-start gap-2 mb-5">
                <KurumiIcon size={36} />
                <div className="relative rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed" style={{ background: '#FFF3E4', color: '#5D4037' }}>
                  まずはご家族のお名前と生年月日を入力してくださいね。名前はひらがなでもOKですよ！
                  <div className="absolute -left-1.5 top-2.5 w-3 h-3 rotate-45" style={{ background: '#FFF3E4' }} />
                </div>
              </div>

              {/* 家族図 */}
              <FamilyDiagram members={members} />

              {/* 保護者 */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold tracking-wider uppercase" style={{ color: '#8D6E63' }}>保護者</p>
                {parents.map((parent) => (
                  <FamilyMemberForm
                    key={parent.id} member={parent}
                    onChange={(m) => updateMember(parent.id, m)}
                    onRemove={() => removeParent(parent.id)}
                    canRemove={parents.length > 1}
                  />
                ))}
                {parents.length < 2 && (
                  <button onClick={addParent}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01]"
                    style={{ borderColor: '#D7CCC8', color: '#8D6E63', background: 'rgba(141,110,99,0.03)' }}>
                    + 保護者を追加する
                  </button>
                )}
              </div>

              {/* お子さん */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-bold tracking-wider uppercase" style={{ color: '#8D6E63' }}>お子さん</p>
                {children.map((child) => (
                  <FamilyMemberForm
                    key={child.id} member={child}
                    onChange={(m) => updateMember(child.id, m)}
                    onRemove={() => removeChild(child.id)}
                    canRemove={children.length > 1}
                  />
                ))}
                <button onClick={addChild}
                  className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{ borderColor: '#FFAB91', color: '#FF7043', background: 'rgba(255,140,107,0.05)' }}>
                  + お子さんを追加する
                </button>
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
              <button
                onClick={runDiagnosis}
                disabled={!canDiagnose()}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: canDiagnose() ? 'linear-gradient(135deg, #FF7043, #FF8C6B)' : '#D7CCC8' }}
              >
                家族のトリセツを作る
              </button>
              {!canDiagnose() && (
                <p className="text-xs text-center mt-2" style={{ color: '#BCAAA4' }}>
                  保護者とお子さんの生年月日を入力してください
                </p>
              )}
            </section>
          </main>
        </>
      )}

      {/* ============ 結果画面 ============ */}
      {step === 'result' && currentParent && currentChild && currentCompatibility && (
        <>
          {/* 結果ヘッダー */}
          <div style={{ background: 'linear-gradient(135deg, #FFF3E4 0%, #FFE8D6 50%, #E8F5E9 100%)' }}>
            <div className="max-w-lg mx-auto px-5 pt-8 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <KurumiIcon size={44} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#8D6E63' }}>FAMILY COMPASS</p>
                  <h1 className="text-xl font-extrabold" style={{ color: '#3E2723' }}>
                    あなたの家族のトリセツ
                  </h1>
                </div>
              </div>
            </div>

            {/* 家族図 */}
            <div className="max-w-lg mx-auto px-5 pb-4">
              <FamilyDiagram members={diagnosedMembers} selectedPairIds={[currentParent.id, currentChild.id]} />
            </div>

            <svg viewBox="0 0 400 30" className="w-full block" preserveAspectRatio="none" style={{ height: '24px' }}>
              <path d="M0 30 C100 0, 300 0, 400 30 L400 30 L0 30 Z" fill="#FFFBF5" />
            </svg>
          </div>

          <main className="max-w-lg mx-auto px-5 pb-10 space-y-6">
            {/* ペア選択 */}
            {(validParents.length > 1 || validChildren.length > 1) && (
              <div className="rounded-2xl p-4 border shadow-sm animate-fade-in-up" style={{ background: '#FFF8F0', borderColor: '#FFE0B2' }}>
                <p className="text-xs mb-2" style={{ color: '#8D6E63' }}>表示する親子ペアを選択</p>
                <div className="flex gap-2 items-center">
                  <select value={selectedParentIdx} onChange={(e) => handlePairChange(Number(e.target.value), selectedChildIdx)}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#FFE0B2', color: '#3E2723' }}>
                    {validParents.map((p, i) => <option key={p.id} value={i}>{p.roleLabel}</option>)}
                  </select>
                  <span style={{ color: '#BCAAA4' }}>&times;</span>
                  <select value={selectedChildIdx} onChange={(e) => handlePairChange(selectedParentIdx, Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#FFE0B2', color: '#3E2723' }}>
                    {validChildren.map((c, i) => <option key={c.id} value={i}>{c.roleLabel}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* 診断結果 */}
            <div className="animate-fade-in-up">
              <DiagnosisResultView
                parent={currentParent} child={currentChild}
                compatibility={currentCompatibility} concernHints={currentConcernHints}
              />
            </div>

            {/* くるみ先生チャット */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <AIFeedback
                parent={currentParent} child={currentChild}
                compatibility={currentCompatibility} concernHints={currentConcernHints}
              />
            </div>

            {/* 戻るボタン */}
            <button
              onClick={() => { setStep('input'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full py-3 rounded-2xl border-2 font-bold transition-all hover:scale-[1.01]"
              style={{ borderColor: '#D7CCC8', color: '#8D6E63', background: 'white' }}
            >
              もう一度やり直す
            </button>
          </main>
        </>
      )}

      {/* フッター */}
      <footer className="text-center py-8 text-xs" style={{ color: '#BCAAA4' }}>
        <p>Family Compass &mdash; 算命学 &times; 姓名判断で家族の絆を深める</p>
        <p className="mt-1">※ 本診断はエンターテインメントを目的としています</p>
      </footer>
    </div>
  );
}
