'use client';

import type { FamilyMember } from '@/lib/types';

interface Props {
  member: FamilyMember;
  onChange: (member: FamilyMember) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export default function FamilyMemberForm({ member, onChange, onRemove, canRemove }: Props) {
  const currentYear = new Date().getFullYear();

  const update = (patch: Partial<FamilyMember>) => {
    onChange({ ...member, ...patch });
  };

  const isParent = member.role === 'parent';
  const isGrandparent = member.role === 'grandparent';
  const accentColor = isGrandparent ? '#7E57C2' : (isParent ? '#FF7043' : '#4CAF50');
  const lightColor = isGrandparent ? '#EDE7F6' : (isParent ? '#FFF3E4' : '#E8F5E9');

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

      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: lightColor, color: accentColor, border: `2px solid ${accentColor}` }}>
          {member.givenName ? [...member.givenName][0] : [...member.roleLabel][0]}
        </div>
        <input
          type="text"
          value={member.roleLabel}
          onChange={(e) => update({ roleLabel: e.target.value })}
          className="text-base font-bold border-b-2 border-transparent hover:border-[#FFAB91] focus:border-[#FF7043] outline-none bg-transparent transition-colors px-1"
          style={{ color: '#3E2723' }}
          placeholder="呼び名"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs block mb-1" style={{ color: '#8D6E63' }}>姓</label>
          <input
            type="text"
            value={member.familyName}
            onChange={(e) => update({ familyName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{ borderColor: '#FFE0B2', color: '#3E2723', background: '#FFFBF5' }}
            placeholder="山田"
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: '#8D6E63' }}>名</label>
          <input
            type="text"
            value={member.givenName}
            onChange={(e) => update({ givenName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{ borderColor: '#FFE0B2', color: '#3E2723', background: '#FFFBF5' }}
            placeholder="太郎"
          />
        </div>
      </div>

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
    </div>
  );
}
