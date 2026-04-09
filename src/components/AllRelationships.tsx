'use client';

import type { RelationshipResult } from '@/lib/types';

interface Props {
  relationships: RelationshipResult[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}

export default function AllRelationships({ relationships, selectedIdx, onSelect }: Props) {
  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: '#8D6E63' }}>
        相性を表示するには、2人以上の家族の生年月日が必要です。
      </div>
    );
  }

  const current = relationships[selectedIdx];

  const compatStyles = {
    '◎': { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32', label: '相性バツグン！' },
    '○': { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17', label: 'いい感じ！' },
    '△': { bg: '#FFF3E0', border: '#FFAB91', text: '#E64A19', label: 'ちょっと工夫が必要' },
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #FFE0B2' }}>
        <h3 className="font-extrabold text-base mb-1" style={{ color: '#3E2723' }}>
          全員の相性マップ
        </h3>
        <p className="text-xs" style={{ color: '#8D6E63' }}>
          {relationships.length}通りの関係性を診断しました。タップで詳細を見れます。
        </p>
      </div>

      {/* 関係一覧 */}
      <div className="grid grid-cols-1 gap-2">
        {relationships.map((rel, i) => {
          const style = compatStyles[rel.compatibility.compatibility];
          const isSelected = i === selectedIdx;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className="text-left rounded-xl p-3 transition-all"
              style={{
                background: isSelected ? style.bg : 'white',
                border: `2px solid ${isSelected ? style.border : '#FFE0B2'}`,
                boxShadow: isSelected ? `0 2px 8px ${style.border}40` : 'none',
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rel.compatibility.compatibility}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#3E2723' }}>
                      {rel.memberA.roleLabel} → {rel.memberB.roleLabel}
                    </p>
                    <p className="text-xs" style={{ color: '#8D6E63' }}>
                      {rel.memberA.sanmeigaku?.mainStar} × {rel.memberB.sanmeigaku?.mainStar}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: style.text }}>{style.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 選択された関係の詳細 */}
      {current && (
        <div className="rounded-2xl p-5 space-y-3" style={{
          background: compatStyles[current.compatibility.compatibility].bg,
          border: `2px solid ${compatStyles[current.compatibility.compatibility].border}`,
        }}>
          <h4 className="font-extrabold text-base" style={{ color: '#3E2723' }}>
            {current.memberA.roleLabel} → {current.memberB.roleLabel}
          </h4>
          <p className="text-sm" style={{ color: '#5D4037' }}>{current.compatibility.summary}</p>

          {current.compatibility.detailedAdvice && (
            <p className="text-sm leading-relaxed" style={{ color: '#3E2723' }}>
              {current.compatibility.detailedAdvice}
            </p>
          )}

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#2E7D32' }}>おすすめの接し方</p>
            <p className="text-sm" style={{ color: '#3E2723' }}>{current.compatibility.howToApproach}</p>
          </div>

          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#C62828' }}>これは避けてね</p>
            <p className="text-sm" style={{ color: '#3E2723' }}>{current.compatibility.ngAction}</p>
          </div>

          {current.compatibility.dailyRoutine && current.compatibility.dailyRoutine.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#1565C0' }}>毎日の関わりポイント</p>
              <ul className="space-y-1">
                {current.compatibility.dailyRoutine.map((tip, i) => (
                  <li key={i} className="text-sm flex gap-1.5" style={{ color: '#3E2723' }}>
                    <span style={{ color: '#1565C0' }}>•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {current.compatibility.conflictResolution && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>ぶつかった時は</p>
              <p className="text-sm" style={{ color: '#3E2723' }}>{current.compatibility.conflictResolution}</p>
            </div>
          )}

          {current.compatibility.specialMoment && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#7B1FA2' }}>絆が深まる瞬間</p>
              <p className="text-sm" style={{ color: '#3E2723' }}>{current.compatibility.specialMoment}</p>
            </div>
          )}

          {current.compatibility.growthOpportunity && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#00695C' }}>この関係から学べること</p>
              <p className="text-sm" style={{ color: '#3E2723' }}>{current.compatibility.growthOpportunity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
