'use client';

import type { FamilyMember } from '@/lib/types';

interface Props {
  members: FamilyMember[];
  selectedPairIds?: [string, string];
}

function getDisplayChar(member: FamilyMember): string {
  // 名前があれば頭文字、なければ呼び名の頭文字
  if (member.givenName) return [...member.givenName][0];
  if (member.roleLabel) return [...member.roleLabel][0];
  return '?';
}

export default function FamilyDiagram({ members, selectedPairIds }: Props) {
  const parents = members.filter((m) => m.role === 'parent');
  const children = members.filter((m) => m.role === 'child');
  const grandparents = members.filter((m) => m.role === 'grandparent');

  const svgW = 400;
  const hasGP = grandparents.length > 0;
  const svgH = hasGP ? 340 : (parents.length <= 1 && children.length <= 1 ? 220 : 280);
  const centerX = svgW / 2;

  // 祖父母の位置
  const gpY = 40;
  const gpSpacing = Math.min(90, (svgW - 80) / Math.max(grandparents.length, 1));
  const gpStartX = centerX - ((grandparents.length - 1) * gpSpacing) / 2;
  const gpPositions = grandparents.map((_, i) => ({ x: gpStartX + i * gpSpacing, y: gpY }));

  // 親が1人の場合は中央に、2人の場合は左右に
  const parentY = hasGP ? 130 : 55;
  const parentSpacing = 130;
  const parentPositions = parents.length === 1
    ? [{ x: centerX, y: parentY }]
    : parents.map((_, i) => ({
        x: centerX + (i === 0 ? -parentSpacing / 2 : parentSpacing / 2),
        y: parentY,
      }));

  const childY = parents.length === 0 ? 55 : (hasGP ? 260 : (parents.length === 1 && children.length === 1 ? 180 : 210));
  const childSpacing = Math.min(100, (svgW - 80) / Math.max(children.length, 1));
  const childStartX = centerX - ((children.length - 1) * childSpacing) / 2;
  const childPositions = children.map((_, i) => ({
    x: childStartX + i * childSpacing,
    y: childY,
  }));

  const isSelected = (id: string): boolean => selectedPairIds?.includes(id) ?? false;

  // ノードの色
  const parentColor = (sel: boolean) => sel ? '#FF7043' : '#FFAB91';
  const parentBg = (sel: boolean) => sel ? '#FF7043' : '#FFF3E4';
  const childColor = (sel: boolean) => sel ? '#4CAF50' : '#A5D6A7';
  const childBg = (sel: boolean) => sel ? '#81C784' : '#E8F5E9';

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-sm">
        <defs>
          <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000010" />
          </filter>
        </defs>

        {/* 親→子の接続線 */}
        {parentPositions.map((pp, pi) =>
          childPositions.map((cp, ci) => {
            const parentId = parents[pi]?.id;
            const childId = children[ci]?.id;
            const highlighted = selectedPairIds && selectedPairIds[0] === parentId && selectedPairIds[1] === childId;
            const midY = (pp.y + cp.y) / 2 + 10;
            return (
              <path
                key={`${pi}-${ci}`}
                d={`M${pp.x},${pp.y + 28} Q${(pp.x + cp.x) / 2},${midY} ${cp.x},${cp.y - 24}`}
                stroke={highlighted ? '#FF7043' : '#E0D5CC'}
                strokeWidth={highlighted ? 2.5 : 1.5}
                fill="none"
                strokeDasharray={highlighted ? '' : '5 3'}
              />
            );
          })
        )}

        {/* 親同士の接続線（2人いる場合のみ、シンプルな線） */}
        {parentPositions.length === 2 && (
          <line
            x1={parentPositions[0].x + 28} y1={parentPositions[0].y}
            x2={parentPositions[1].x - 28} y2={parentPositions[1].y}
            stroke="#E0D5CC" strokeWidth="1.5" strokeDasharray="4 3"
          />
        )}

        {/* 親ノード */}
        {parents.map((parent, i) => {
          const pos = parentPositions[i];
          if (!pos) return null;
          const sel = isSelected(parent.id);
          const char = getDisplayChar(parent);
          return (
            <g key={parent.id} filter="url(#nodeShadow)">
              <circle cx={pos.x} cy={pos.y} r={26}
                fill={parentBg(sel)}
                stroke={parentColor(sel)}
                strokeWidth={sel ? 3 : 2}
              />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="16" fontWeight="bold" fill={sel ? 'white' : '#5D4037'}>
                {char}
              </text>
              <text x={pos.x} y={pos.y + 40} textAnchor="middle" fontSize="11"
                fill={sel ? '#E64A19' : '#5D4037'} fontWeight={sel ? 'bold' : 'normal'}>
                {parent.roleLabel}
              </text>
              {parent.sanmeigaku && (
                <text x={pos.x} y={pos.y + 54} textAnchor="middle" fontSize="9" fill="#8D6E63">
                  {parent.sanmeigaku.mainStar}
                </text>
              )}
            </g>
          );
        })}

        {/* 祖父母ノード */}
        {grandparents.map((gp, i) => {
          const pos = gpPositions[i];
          if (!pos) return null;
          const sel = isSelected(gp.id);
          const char = getDisplayChar(gp);
          return (
            <g key={gp.id} filter="url(#nodeShadow)">
              <circle cx={pos.x} cy={pos.y} r={20}
                fill={sel ? '#9575CD' : '#EDE7F6'}
                stroke={sel ? '#7E57C2' : '#B39DDB'}
                strokeWidth={sel ? 3 : 2}
              />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fontWeight="bold" fill={sel ? 'white' : '#4527A0'}>
                {char}
              </text>
              <text x={pos.x} y={pos.y + 32} textAnchor="middle" fontSize="10"
                fill={sel ? '#4527A0' : '#5D4037'} fontWeight={sel ? 'bold' : 'normal'}>
                {gp.roleLabel}
              </text>
              {gp.sanmeigaku && (
                <text x={pos.x} y={pos.y + 44} textAnchor="middle" fontSize="8" fill="#7E57C2">
                  {gp.sanmeigaku.mainStar}
                </text>
              )}
            </g>
          );
        })}

        {/* 祖父母→親の接続線 */}
        {gpPositions.map((gp, gi) =>
          parentPositions.map((pp, pi) => (
            <line key={`gp${gi}-p${pi}`}
              x1={gp.x} y1={gp.y + 20} x2={pp.x} y2={pp.y - 26}
              stroke="#D1C4E9" strokeWidth="1.5" strokeDasharray="4 3" />
          ))
        )}

        {/* 子ノード */}
        {children.map((child, i) => {
          const pos = childPositions[i];
          if (!pos) return null;
          const sel = isSelected(child.id);
          const char = getDisplayChar(child);
          return (
            <g key={child.id} filter="url(#nodeShadow)">
              <circle cx={pos.x} cy={pos.y} r={22}
                fill={childBg(sel)}
                stroke={childColor(sel)}
                strokeWidth={sel ? 3 : 2}
              />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="14" fontWeight="bold" fill={sel ? 'white' : '#2E7D32'}>
                {char}
              </text>
              <text x={pos.x} y={pos.y + 36} textAnchor="middle" fontSize="11"
                fill={sel ? '#2E7D32' : '#5D4037'} fontWeight={sel ? 'bold' : 'normal'}>
                {child.roleLabel}
              </text>
              {child.sanmeigaku && (
                <text x={pos.x} y={pos.y + 50} textAnchor="middle" fontSize="9" fill="#558B2F">
                  {child.sanmeigaku.mainStar}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
