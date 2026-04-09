'use client';

import { useState } from 'react';
import type { FamilyMember } from '@/lib/types';
import type { MainStar } from '@/lib/sanmeigaku';
import { AGE_STAGES, AGE_STAGE_GUIDE } from '@/data/age-guide';

interface Props {
  child: FamilyMember;
}

export default function AgeGuideView({ child }: Props) {
  const [selectedStage, setSelectedStage] = useState(0);

  if (!child.sanmeigaku) return null;

  const star = child.sanmeigaku.mainStar as MainStar;
  const stage = AGE_STAGES[selectedStage];
  const guide = AGE_STAGE_GUIDE[star]?.[stage.id];

  if (!guide) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #FFE0B2' }}>
        <h3 className="font-extrabold text-base mb-1" style={{ color: '#3E2723' }}>
          {child.roleLabel}の年齢別ガイド
        </h3>
        <p className="text-xs" style={{ color: '#8D6E63' }}>
          {child.sanmeigaku.mainStar}（{child.sanmeigaku.starInfo.keyword}）の各年齢での関わり方
        </p>
      </div>

      {/* 年齢段階タブ */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {AGE_STAGES.map((s, i) => (
          <button key={s.id} onClick={() => setSelectedStage(i)}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: selectedStage === i ? '#FF7043' : '#FFF3E4',
              color: selectedStage === i ? 'white' : '#8D6E63',
              border: selectedStage === i ? 'none' : '1px solid #FFE0B2',
            }}>
            <span className="block">{s.label}</span>
            <span className="block text-[10px] opacity-80">{s.ageRange}</span>
          </button>
        ))}
      </div>

      {/* ガイド内容 */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'white', border: '1.5px solid #FFE0B2', boxShadow: '0 2px 12px rgba(255,112,67,0.06)' }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FF7043', color: 'white' }}>
              {stage.label}
            </span>
            <span className="text-xs" style={{ color: '#8D6E63' }}>{stage.ageRange}</span>
            <span className="text-xs font-bold" style={{ color: '#E64A19' }}>{guide.keyTheme}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#3E2723' }}>{guide.description}</p>
        </div>

        {/* 毎日できること */}
        <div className="rounded-xl p-4" style={{ background: '#E8F5E9' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#2E7D32' }}>毎日できる関わり方</p>
          <ul className="space-y-2">
            {guide.dailyTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: '#1B5E20' }}>
                <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#81C784', color: 'white' }}>
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 注意サイン */}
        <div className="rounded-xl p-4" style={{ background: '#FFF3E0' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#E65100' }}>こんなサインが出たら注意</p>
          <p className="text-sm" style={{ color: '#BF360C' }}>{guide.warningSign}</p>
        </div>

        {/* マイルストーン */}
        <div className="rounded-xl p-4" style={{ background: '#F3E5F5' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#7B1FA2' }}>この時期の成長マイルストーン</p>
          <p className="text-sm" style={{ color: '#4A148C' }}>{guide.milestone}</p>
        </div>
      </div>
    </div>
  );
}
