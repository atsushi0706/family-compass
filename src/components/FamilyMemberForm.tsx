'use client';

import type { FamilyMember } from '@/lib/types';

interface Props {
  member: FamilyMember;
  onChange: (member: FamilyMember) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

const RELATION_OPTIONS: Record<FamilyMember['role'], { value: string; label: string }[]> = {
  parent: [
    { value: 'ママ', label: 'お母さん' },
    { value: 'パパ', label: 'お父さん' },
    { value: '先生', label: '先生（担任・保育士等）' },
    { value: '', label: 'その他（自由入力）' },
  ],
  child: [
    { value: '長女', label: '長女' },
    { value: '長男', label: '長男' },
    { value: '次女', label: '次女' },
    { value: '次男', label: '次男' },
    { value: '三女', label: '三女' },
    { value: '三男', label: '三男' },
    { value: '', label: 'その他（自由入力）' },
  ],
  grandparent: [
    { value: 'おばあちゃん', label: 'おばあちゃん' },
    { value: 'おじいちゃん', label: 'おじいちゃん' },
    { value: '', label: 'その他（自由入力）' },
  ],
};

// 表示名を決定：呼び名があればそれ、なければ名前、なければデフォルト
export function getDisplayName(member: FamilyMember): string {
  if (member.givenName) return member.givenName;
  if (member.roleLabel) return member.roleLabel;
  return '未入力';
}

export default function FamilyMemberForm({ member, onChange, onRemove, canRemove }: Props) {
  const currentYear = new Date().getFullYear();

  const update = (patch: Partial<FamilyMember>) => {
    onChange({ ...member, ...patch });
  };

  const handleRelationSelect = (value: string) => {
    if (value === '__custom__') {
      update({ roleLabel: '' });
    } else {
      update({ roleLabel: value });
    }
  };

  const isParent = member.role === 'parent';
  const isGrandparent = member.role === 'grandparent';
  const accentColor = isGrandparent ? '#7E57C2' : (isParent ? '#FF7043' : '#4CAF50');
  const lightColor = isGrandparent ? '#EDE7F6' : (isParent ? '#FFF3E4' : '#E8F5E9');

  const options = RELATION_OPTIONS[member.role] || [];
  const isPreset = options.some((o) => o.value === member.roleLabel && o.value !== '');

  return (
    <div className="rounded-2xl p-5 relative transition-all hover:shadow-md"
      style={{ background: 'white', border: '1.5px solid #FFE0B2', boxShadow: '0 2px 8px rgba(255,112,67,0.06)' }}>
      {canRemove && (
        <button onClick={onRemove}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{ color: '#BCAAA4', background: '#FFF3E4' }}
          title="削除">
          &times;
        </button>
      )}

      {/* 続柄アイコン + 続柄選択 */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: lightColor, color: accentColor, border: `2px solid ${accentColor}` }}>
          {member.givenName ? [...member.givenName][0] : (member.roleLabel ? [...member.roleLabel][0] : '?')}
        </div>
        <div className="flex-1">
          <label className="text-[10px] block mb-0.5" style={{ color: '#8D6E63' }}>続柄</label>
          <div className="flex gap-1.5 flex-wrap">
            {options.map((opt) => (
              <button key={opt.value || '__custom__'}
                onClick={() => handleRelationSelect(opt.value || '__custom__')}
                className="px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: (opt.value === '' ? !isPreset : member.roleLabel === opt.value) ? accentColor : lightColor,
                  color: (opt.value === '' ? !isPreset : member.roleLabel === opt.value) ? 'white' : accentColor,
                }}>
                {opt.value || 'その他'}
              </button>
            ))}
          </div>
          {/* 自由入力（その他選択時 or プリセットにない値） */}
          {!isPreset && (
            <input
              type="text"
              value={member.roleLabel}
              onChange={(e) => update({ roleLabel: e.target.value })}
              className="mt-1.5 w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: '#FFE0B2', color: '#3E2723', background: '#FFFBF5' }}
              placeholder="続柄を入力（例：叔母、いとこ等）"
            />
          )}
        </div>
      </div>

      {/* 名前入力 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs block mb-1" style={{ color: '#8D6E63' }}>姓</label>
          <input type="text" value={member.familyName}
            onChange={(e) => update({ familyName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{ borderColor: '#FFE0B2', color: '#3E2723', background: '#FFFBF5' }}
            placeholder="山田" />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: '#8D6E63' }}>名前</label>
          <input type="text" value={member.givenName}
            onChange={(e) => update({ givenName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{ borderColor: '#FFE0B2', color: '#3E2723', background: '#FFFBF5' }}
            placeholder="太郎" />
        </div>
      </div>

      {/* 生年月日 */}
      <div>
        <label className="text-xs block mb-1" style={{ color: '#8D6E63' }}>生年月日</label>
        <div className="grid grid-cols-3 gap-2">
          <select value={member.birthYear || ''} onChange={(e) => update({ birthYear: Number(e.target.value) })}
            className="w-full px-2 py-2.5 rounded-xl border outline-none transition-all text-sm appearance-none"
            style={{ borderColor: '#FFE0B2', color: member.birthYear ? '#3E2723' : '#BCAAA4', background: '#FFFBF5' }}>
            <option value="">年</option>
            {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={member.birthMonth || ''} onChange={(e) => update({ birthMonth: Number(e.target.value) })}
            className="w-full px-2 py-2.5 rounded-xl border outline-none transition-all text-sm appearance-none"
            style={{ borderColor: '#FFE0B2', color: member.birthMonth ? '#3E2723' : '#BCAAA4', background: '#FFFBF5' }}>
            <option value="">月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={member.birthDay || ''} onChange={(e) => update({ birthDay: Number(e.target.value) })}
            className="w-full px-2 py-2.5 rounded-xl border outline-none transition-all text-sm appearance-none"
            style={{ borderColor: '#FFE0B2', color: member.birthDay ? '#3E2723' : '#BCAAA4', background: '#FFFBF5' }}>
            <option value="">日</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 入力済みの表示名プレビュー */}
      {member.givenName && (
        <p className="text-xs mt-3 text-center" style={{ color: '#8D6E63' }}>
          表示名: <span className="font-bold" style={{ color: accentColor }}>{member.roleLabel}（{member.givenName}）</span>
        </p>
      )}
    </div>
  );
}
