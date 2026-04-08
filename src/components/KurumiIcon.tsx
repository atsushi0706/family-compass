'use client';

// くるみ先生（エプロンリス）のSVGアイコン
export default function KurumiIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 背景円 */}
      <circle cx="60" cy="60" r="58" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="2" />

      {/* しっぽ */}
      <path d="M85 45 C95 25, 110 30, 105 50 C100 65, 90 60, 88 55" fill="#C2956A" />
      <path d="M88 48 C95 32, 106 35, 102 50 C99 60, 92 57, 90 53" fill="#D4A97A" />

      {/* 体 */}
      <ellipse cx="60" cy="82" rx="24" ry="22" fill="#C2956A" />

      {/* エプロン */}
      <path d="M42 72 L78 72 L75 100 L45 100 Z" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.5" />
      <path d="M50 72 L50 68 Q60 62 70 68 L70 72" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="1.5" />
      {/* エプロンのリボン */}
      <path d="M55 72 Q60 69 65 72" stroke="#FB923C" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="71" r="2" fill="#FB923C" />
      {/* エプロンのポケット */}
      <rect x="52" y="82" width="16" height="10" rx="3" fill="none" stroke="#FDBA74" strokeWidth="1" />
      {/* ポケットからハート */}
      <path d="M58 84 C58 82 61 82 61 84 C61 86 59.5 88 59.5 88 C59.5 88 58 86 58 84Z" fill="#FB923C" opacity="0.6" />

      {/* 頭 */}
      <ellipse cx="60" cy="42" rx="22" ry="20" fill="#C2956A" />

      {/* 耳 */}
      <ellipse cx="40" cy="24" rx="8" ry="10" fill="#C2956A" />
      <ellipse cx="40" cy="24" rx="5" ry="7" fill="#E8C9A8" />
      <ellipse cx="80" cy="24" rx="8" ry="10" fill="#C2956A" />
      <ellipse cx="80" cy="24" rx="5" ry="7" fill="#E8C9A8" />

      {/* 顔の白い部分 */}
      <ellipse cx="60" cy="46" rx="16" ry="14" fill="#E8D5BD" />

      {/* 目 */}
      <ellipse cx="52" cy="40" rx="3.5" ry="4" fill="#2C1810" />
      <ellipse cx="68" cy="40" rx="3.5" ry="4" fill="#2C1810" />
      {/* 目のハイライト */}
      <circle cx="53.5" cy="38.5" r="1.5" fill="white" />
      <circle cx="69.5" cy="38.5" r="1.5" fill="white" />

      {/* ほっぺ */}
      <ellipse cx="44" cy="47" rx="5" ry="3" fill="#FDBA74" opacity="0.5" />
      <ellipse cx="76" cy="47" rx="5" ry="3" fill="#FDBA74" opacity="0.5" />

      {/* 鼻 */}
      <ellipse cx="60" cy="46" rx="2.5" ry="2" fill="#8B6548" />

      {/* 口（にっこり） */}
      <path d="M55 50 Q60 55 65 50" stroke="#8B6548" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 手 */}
      <ellipse cx="38" cy="78" rx="6" ry="5" fill="#C2956A" />
      <ellipse cx="82" cy="78" rx="6" ry="5" fill="#C2956A" />
    </svg>
  );
}
