'use client';

import { CONCERNS, type Concern } from '@/data/concerns';

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ConcernSelector({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {CONCERNS.map((concern: Concern) => {
        const isActive = selected.includes(concern.id);
        return (
          <button
            key={concern.id}
            onClick={() => toggle(concern.id)}
            className="text-left p-3 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: isActive ? '#FF7043' : '#FFE0B2',
              background: isActive ? 'linear-gradient(135deg, #FFF3E4, #FFE8D6)' : 'white',
              boxShadow: isActive ? '0 2px 8px rgba(255,112,67,0.15)' : 'none',
            }}
          >
            <p className="text-sm font-bold" style={{ color: isActive ? '#E64A19' : '#5D4037' }}>
              {concern.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#A1887F' }}>{concern.description}</p>
          </button>
        );
      })}
    </div>
  );
}
