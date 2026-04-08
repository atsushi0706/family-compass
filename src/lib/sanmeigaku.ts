// 算命学コアロジック
// 生年月日から日干（十干）を算出し、主星を決定する

// 十干（じっかん）
export const JIKKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type Jikkan = typeof JIKKAN[number];

// 十二支（じゅうにし）
export const JUNISHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type Junishi = typeof JUNISHI[number];

// 十大主星
export const MAIN_STARS = [
  '貫索星', '石門星', '鳳閣星', '調舒星', '禄存星',
  '司禄星', '車騎星', '牽牛星', '龍高星', '玉堂星',
] as const;
export type MainStar = typeof MAIN_STARS[number];

// 主星の詳細情報
export const STAR_INFO: Record<MainStar, {
  keyword: string;
  element: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  childDescription: string;
}> = {
  '貫索星': {
    keyword: '自立・独立',
    element: '木（兄）',
    traits: ['自分の世界を大切にする', '芯が強い', 'マイペース'],
    strengths: ['集中力が高い', '自分で考えて行動できる', '粘り強い'],
    weaknesses: ['頑固になりやすい', '人に頼るのが苦手', '孤立しがち'],
    childDescription: '自分のペースを大事にするお子さん。無理に急かさず、じっくり見守ることで才能が開花します。',
  },
  '石門星': {
    keyword: '社交・協調',
    element: '木（弟）',
    traits: ['人と関わるのが好き', '仲間意識が強い', '柔軟'],
    strengths: ['コミュニケーション力が高い', 'グループをまとめられる', '適応力がある'],
    weaknesses: ['八方美人になりやすい', '自分の意見を言えないことがある', '流されやすい'],
    childDescription: 'お友達との関わりの中で成長するお子さん。集団活動や遊びの中で輝きます。',
  },
  '鳳閣星': {
    keyword: '楽観・表現',
    element: '火（兄）',
    traits: ['明るく楽しいことが好き', '表現力豊か', 'おおらか'],
    strengths: ['ムードメーカー', '食べることが好き', 'ストレスに強い'],
    weaknesses: ['飽きっぽい', 'のんびりしすぎる', '計画性に欠ける'],
    childDescription: '楽しいことが大好きで場を明るくするお子さん。遊びの中から多くを学びます。',
  },
  '調舒星': {
    keyword: '感性・繊細',
    element: '火（弟）',
    traits: ['感受性が豊か', '芸術的センスがある', '完璧主義'],
    strengths: ['細やかな気配りができる', '美的感覚が優れている', '深く考えられる'],
    weaknesses: ['傷つきやすい', '気分のムラがある', '孤独を感じやすい'],
    childDescription: '繊細で感受性豊かなお子さん。気持ちに寄り添い、安心できる環境を作ってあげてください。',
  },
  '禄存星': {
    keyword: '魅力・奉仕',
    element: '土（兄）',
    traits: ['人を惹きつける', 'サービス精神旺盛', '愛情深い'],
    strengths: ['誰とでも仲良くなれる', '面倒見が良い', '華やかな存在感'],
    weaknesses: ['おせっかいになりやすい', '見栄っ張り', '散財しやすい'],
    childDescription: '人を喜ばせることが大好きなお子さん。「ありがとう」の言葉が最大のモチベーションです。',
  },
  '司禄星': {
    keyword: '堅実・蓄積',
    element: '土（弟）',
    traits: ['コツコツ型', '家庭的', '忍耐強い'],
    strengths: ['真面目で努力家', 'お金や物を大切にする', '信頼される'],
    weaknesses: ['変化が苦手', '心配性', '地味に見られがち'],
    childDescription: 'コツコツ積み重ねるのが得意なお子さん。焦らず長い目で見守ると大きく成長します。',
  },
  '車騎星': {
    keyword: '行動・闘争',
    element: '金（兄）',
    traits: ['行動力抜群', '負けず嫌い', 'スピード感がある'],
    strengths: ['決断が早い', '体力がある', 'リーダーシップ'],
    weaknesses: ['短気', 'じっとしていられない', '衝突しやすい'],
    childDescription: 'エネルギッシュで行動派のお子さん。体を動かす活動で才能が発揮されます。',
  },
  '牽牛星': {
    keyword: '責任・名誉',
    element: '金（弟）',
    traits: ['責任感が強い', 'プライドが高い', '礼儀正しい'],
    strengths: ['目標に向かって努力できる', 'ルールを守る', '品格がある'],
    weaknesses: ['融通が利かない', 'プレッシャーに弱い', '自分を追い込みやすい'],
    childDescription: '真面目で責任感の強いお子さん。努力を認めて褒めてあげることが大切です。',
  },
  '龍高星': {
    keyword: '冒険・改革',
    element: '水（兄）',
    traits: ['好奇心旺盛', '型破り', '海外志向'],
    strengths: ['新しいことへの挑戦心', '発想力が豊か', '行動範囲が広い'],
    weaknesses: ['落ち着きがない', '飽きっぽい', '規則を守るのが苦手'],
    childDescription: '好奇心のかたまりのようなお子さん。「なぜ？」を大切にし、探求心を伸ばしてあげてください。',
  },
  '玉堂星': {
    keyword: '学習・伝統',
    element: '水（弟）',
    traits: ['学ぶことが好き', '知的', '伝統を重んじる'],
    strengths: ['理解力が高い', '教えるのが上手', '穏やかで知的'],
    weaknesses: ['理屈っぽい', '実践が苦手', '保守的になりやすい'],
    childDescription: '学びが大好きな知的なお子さん。本や図鑑など、知的好奇心を満たす環境を整えてあげてください。',
  },
};

/**
 * グレゴリオ暦からユリウス日数を計算
 */
function toJulianDayNumber(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * 生年月日から日干（十干のインデックス）を算出
 * 基準日: 1900年1月1日 = 甲子（甲=0）
 */
export function getDayStem(year: number, month: number, day: number): number {
  const baseJD = toJulianDayNumber(1900, 1, 1); // 1900/1/1 の干支は甲子ではないが、補正する
  const targetJD = toJulianDayNumber(year, month, day);
  const diff = Math.floor(targetJD - baseJD);
  // 1900/1/1 は庚子（庚=6）なので +6 の補正
  const stemIndex = ((diff % 10) + 6) % 10;
  return stemIndex >= 0 ? stemIndex : stemIndex + 10;
}

/**
 * 生年月日から日支（十二支のインデックス）を算出
 */
export function getDayBranch(year: number, month: number, day: number): number {
  const baseJD = toJulianDayNumber(1900, 1, 1);
  const targetJD = toJulianDayNumber(year, month, day);
  const diff = Math.floor(targetJD - baseJD);
  // 1900/1/1 は庚子（子=0）なので補正不要
  const branchIndex = diff % 12;
  return branchIndex >= 0 ? branchIndex : branchIndex + 12;
}

/**
 * 年干を算出（西暦の下1桁で決まる）
 */
export function getYearStem(year: number): number {
  // 西暦4年 = 甲子年 → (year - 4) % 10
  return ((year - 4) % 10 + 10) % 10;
}

/**
 * 日干から主星を算出
 * 算命学では日干と他の干の関係で主星が決まるが、
 * MVPでは日干そのものから代表的な主星を割り当てる
 *
 * 甲→貫索星、乙→石門星、丙→鳳閣星、丁→調舒星、戊→禄存星
 * 己→司禄星、庚→車騎星、辛→牽牛星、壬→龍高星、癸→玉堂星
 */
export function getMainStar(dayStemIndex: number): MainStar {
  return MAIN_STARS[dayStemIndex];
}

/**
 * 二人の日干の関係から相性の星を算出
 * (相手の日干 - 自分の日干) の差分で関係性を判定
 */
export function getRelationStar(myStemIndex: number, otherStemIndex: number): MainStar {
  const diff = ((otherStemIndex - myStemIndex) % 10 + 10) % 10;
  return MAIN_STARS[diff];
}

/**
 * 生年月日から算命学の診断結果を返す
 */
export interface SanmeigakuResult {
  dayStem: string;         // 日干の漢字
  dayStemIndex: number;    // 日干のインデックス
  dayBranch: string;       // 日支の漢字
  mainStar: MainStar;     // 主星
  starInfo: typeof STAR_INFO[MainStar]; // 主星の詳細
}

export function diagnoseSanmeigaku(year: number, month: number, day: number): SanmeigakuResult {
  const dayStemIndex = getDayStem(year, month, day);
  const dayBranchIndex = getDayBranch(year, month, day);
  const mainStar = getMainStar(dayStemIndex);

  return {
    dayStem: JIKKAN[dayStemIndex],
    dayStemIndex,
    dayBranch: JUNISHI[dayBranchIndex],
    mainStar,
    starInfo: STAR_INFO[mainStar],
  };
}
