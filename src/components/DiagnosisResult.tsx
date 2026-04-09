'use client';

import type { FamilyMember } from '@/lib/types';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';

interface Props {
  parent: FamilyMember;
  child: FamilyMember;
  compatibility: CompatibilityAdvice;
  concernHints: { concernLabel: string; hint: string }[];
}

export default function DiagnosisResult({ parent, child, compatibility, concernHints }: Props) {
  const parentStar = parent.sanmeigaku;
  const childStar = child.sanmeigaku;
  const childSeimei = child.seimei;

  if (!parentStar || !childStar) return null;

  const compatStyles = {
    '◎': { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', label: '相性バツグン！' },
    '○': { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17', label: 'いい感じ！' },
    '△': { bg: '#FFF3E0', border: '#FFAB91', text: '#E64A19', label: 'ちょっと工夫が必要' },
  }[compatibility.compatibility];

  return (
    <div className="space-y-5">
      {/* 親子の主星カード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #FFF3E4, #FFE8D6)', border: '1px solid #FFCCBC' }}>
          <p className="text-xs font-bold" style={{ color: '#8D6E63' }}>{parent.roleLabel}</p>
          <p className="text-lg font-extrabold mt-1" style={{ color: '#E64A19' }}>{parentStar.mainStar}</p>
          <p className="text-xs mt-0.5" style={{ color: '#A1887F' }}>{parentStar.starInfo.keyword}</p>
          <p className="text-xs mt-2" style={{ color: '#8D6E63' }}>日干: {parentStar.dayStem}（{parentStar.dayBranch}）</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', border: '1px solid #A5D6A7' }}>
          <p className="text-xs font-bold" style={{ color: '#558B2F' }}>{child.roleLabel}</p>
          <p className="text-lg font-extrabold mt-1" style={{ color: '#2E7D32' }}>{childStar.mainStar}</p>
          <p className="text-xs mt-0.5" style={{ color: '#81C784' }}>{childStar.starInfo.keyword}</p>
          <p className="text-xs mt-2" style={{ color: '#558B2F' }}>日干: {childStar.dayStem}（{childStar.dayBranch}）</p>
        </div>
      </div>

      {/* 子供の性格プロファイル */}
      <div className="rounded-2xl p-5" style={{ background: 'white', border: '1.5px solid #FFE0B2', boxShadow: '0 2px 12px rgba(255,112,67,0.06)' }}>
        <h3 className="font-extrabold text-base mb-2" style={{ color: '#3E2723' }}>{child.roleLabel}の個性</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#5D4037' }}>{childStar.starInfo.childDescription}</p>

        {/* 詳細プロファイル */}
        {'detailedProfile' in childStar.starInfo && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#5D4037' }}>
            {(childStar.starInfo as Record<string, unknown>).detailedProfile as string}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background: '#E8F5E9' }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: '#2E7D32' }}>得意なこと</p>
            <ul className="text-xs space-y-1" style={{ color: '#4E6B45' }}>
              {childStar.starInfo.strengths.map((s, i) => <li key={i}>+ {s}</li>)}
            </ul>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#FFF3E0' }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: '#E65100' }}>気をつけたいこと</p>
            <ul className="text-xs space-y-1" style={{ color: '#6D4C2A' }}>
              {childStar.starInfo.weaknesses.map((w, i) => <li key={i}>- {w}</li>)}
            </ul>
          </div>
        </div>

        {/* 隠れた才能・やる気スイッチ・伸びる環境 */}
        {('hiddenTalent' in childStar.starInfo) && (
          <div className="space-y-2">
            <div className="rounded-xl p-3" style={{ background: '#F3E5F5' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#7B1FA2' }}>隠れた才能</p>
              <p className="text-sm" style={{ color: '#4A148C' }}>{(childStar.starInfo as Record<string, unknown>).hiddenTalent as string}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#E3F2FD' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#1565C0' }}>やる気スイッチの入れ方</p>
              <p className="text-sm" style={{ color: '#0D47A1' }}>{(childStar.starInfo as Record<string, unknown>).motivationKey as string}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#E8F5E9' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#2E7D32' }}>伸びる環境</p>
              <p className="text-sm" style={{ color: '#1B5E20' }}>{(childStar.starInfo as Record<string, unknown>).idealEnvironment as string}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#FFF8E1' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#F57F17' }}>ストレスのサイン</p>
              <p className="text-sm" style={{ color: '#E65100' }}>{(childStar.starInfo as Record<string, unknown>).stressSign as string}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#FCE4EC' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#C62828' }}>将来の可能性</p>
              <p className="text-sm" style={{ color: '#880E4F' }}>{(childStar.starInfo as Record<string, unknown>).futureVision as string}</p>
            </div>
          </div>
        )}

        {/* 声かけフレーズ・NGワード */}
        {('communicationTips' in childStar.starInfo) && (
          <div className="grid grid-cols-1 gap-2 mt-4">
            <div className="rounded-xl p-3" style={{ background: '#E8F5E9' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#2E7D32' }}>使ってほしい声かけフレーズ</p>
              <ul className="space-y-1">
                {((childStar.starInfo as Record<string, unknown>).communicationTips as string[]).map((tip, i) => (
                  <li key={i} className="text-sm flex gap-1.5" style={{ color: '#1B5E20' }}>
                    <span>✓</span>「{tip}」
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#FFEBEE' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#C62828' }}>避けてほしいNGワード</p>
              <ul className="space-y-1">
                {((childStar.starInfo as Record<string, unknown>).ngWords as string[]).map((w, i) => (
                  <li key={i} className="text-sm flex gap-1.5" style={{ color: '#B71C1C' }}>
                    <span>✗</span>「{w}」
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 姓名判断 */}
      {childSeimei && (
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1.5px solid #FFE0B2', boxShadow: '0 2px 12px rgba(255,112,67,0.06)' }}>
          <h3 className="font-extrabold text-base mb-3" style={{ color: '#3E2723' }}>{child.roleLabel}の姓名判断</h3>
          {childSeimei.unknownChars.length > 0 && (
            <p className="text-xs mb-3 px-3 py-1.5 rounded-lg" style={{ background: '#FFF3E0', color: '#E65100' }}>
              「{childSeimei.unknownChars.join('、')}」は辞書に未登録のため正確でない場合があります
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: '天格（家系運）', value: childSeimei.tenkaku, meaning: childSeimei.tenkakuMeaning },
              { label: '人格（性格）', value: childSeimei.jinkaku, meaning: childSeimei.jinkakuMeaning },
              { label: '地格（幼少期）', value: childSeimei.chikaku, meaning: childSeimei.chikakuMeaning },
              { label: '総格（生涯運）', value: childSeimei.soukaku, meaning: childSeimei.soukakuMeaning },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: '#FFFBF5', border: '1px solid #FFE0B2' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{item.label}</span>
                <p className="font-bold" style={{ color: '#3E2723' }}>{item.value}画</p>
                <p className="text-xs mt-0.5" style={{ color: '#A1887F' }}>{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相性・接し方カード */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ background: compatStyles.bg, border: `2px solid ${compatStyles.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{compatibility.compatibility}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: compatStyles.text }}>{compatStyles.label}</p>
            <h3 className="font-extrabold text-base" style={{ color: '#3E2723' }}>
              {parent.roleLabel} &times; {child.roleLabel}
            </h3>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: '#5D4037' }}>{compatibility.summary}</p>
        <div className="space-y-2">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#2E7D32' }}>おすすめの接し方</p>
            <p className="text-sm" style={{ color: '#3E2723' }}>{compatibility.howToApproach}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#C62828' }}>これは避けてね</p>
            <p className="text-sm" style={{ color: '#3E2723' }}>{compatibility.ngAction}</p>
          </div>
        </div>
      </div>

      {/* お悩み別ヒント */}
      {concernHints.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1.5px solid #FFE0B2', boxShadow: '0 2px 12px rgba(255,112,67,0.06)' }}>
          <h3 className="font-extrabold text-base mb-3" style={{ color: '#3E2723' }}>お悩み別アドバイス</h3>
          <div className="space-y-2">
            {concernHints.map((hint, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFF3E4)', border: '1px solid #FFE0B2' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>{hint.concernLabel}</p>
                <p className="text-sm" style={{ color: '#5D4037' }}>{hint.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
