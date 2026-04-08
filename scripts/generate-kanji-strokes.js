/**
 * Unicode Unihan データベースから全CJK漢字の画数辞書を自動生成
 * Unihan.zip をダウンロード → 解凍 → kTotalStrokes を抽出
 *
 * 使い方: node scripts/generate-kanji-strokes.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UNIHAN_ZIP_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip';
const TMP_DIR = path.join(__dirname, '..', '.tmp-unihan');
const ZIP_PATH = path.join(TMP_DIR, 'Unihan.zip');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlinkSync(dest); reject(e); });
  });
}

async function main() {
  // 準備
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  // ダウンロード
  console.log('Unihan.zip をダウンロード中...');
  await download(UNIHAN_ZIP_URL, ZIP_PATH);
  console.log('ダウンロード完了');

  // 解凍 (PowerShell使用 - Windows)
  console.log('解凍中...');
  try {
    execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${TMP_DIR}' -Force"`, { stdio: 'pipe' });
  } catch {
    // fallback: tar
    execSync(`tar -xf "${ZIP_PATH}" -C "${TMP_DIR}"`, { stdio: 'pipe' });
  }

  // kTotalStrokes データを探す
  const files = fs.readdirSync(TMP_DIR);
  console.log('展開されたファイル:', files.join(', '));

  // kTotalStrokes は Unihan_DictionaryLikeData.txt か Unihan_IRGSources.txt にある
  let rawData = '';
  for (const f of files) {
    if (f.endsWith('.txt')) {
      const content = fs.readFileSync(path.join(TMP_DIR, f), 'utf8');
      if (content.includes('kTotalStrokes')) {
        console.log(`kTotalStrokes を ${f} から検出`);
        rawData += content + '\n';
      }
    }
  }

  if (!rawData) {
    console.error('kTotalStrokes データが見つかりません');
    process.exit(1);
  }

  // パース
  console.log('画数データを解析中...');
  const strokes = new Map();

  for (const line of rawData.split('\n')) {
    if (!line.startsWith('U+') || !line.includes('kTotalStrokes')) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;

    const codePoint = parseInt(parts[0].slice(2), 16);
    // kTotalStrokes の値が複数ある場合はカンマ区切り or スペース区切り → 最初の値を使用
    const strokeStr = parts[2].trim().split(/[\s,]/)[0];
    const strokeCount = parseInt(strokeStr, 10);

    if (isNaN(codePoint) || isNaN(strokeCount) || strokeCount <= 0) continue;

    const char = String.fromCodePoint(codePoint);
    strokes.set(char, strokeCount);
  }

  console.log(`${strokes.size} 文字の画数データを取得`);

  // TypeScript ファイル生成
  let output = `// 漢字画数辞書（自動生成 - 編集禁止）
// ソース: Unicode Unihan Database (kTotalStrokes)
// 生成日: ${new Date().toISOString().split('T')[0]}
// 収録文字数: ${strokes.size} 文字（CJK統合漢字 + 拡張）
//
// 再生成: node scripts/generate-kanji-strokes.js

export const KANJI_STROKES: Record<string, number> = {\n`;

  // 画数でグループ化
  const byStrokes = new Map();
  for (const [char, count] of strokes) {
    if (!byStrokes.has(count)) byStrokes.set(count, []);
    byStrokes.get(count).push(char);
  }

  const sortedCounts = [...byStrokes.keys()].sort((a, b) => a - b);
  for (const count of sortedCounts) {
    const chars = byStrokes.get(count);
    output += `  // ${count}画 (${chars.length}文字)\n`;
    for (let i = 0; i < chars.length; i += 12) {
      const chunk = chars.slice(i, i + 12);
      const entries = chunk.map(c => `'${c}':${count}`).join(',');
      output += `  ${entries},\n`;
    }
  }

  output += `};\n`;

  // ひらがな・カタカナ
  output += `
// ひらがなの画数
export const HIRAGANA_STROKES: Record<string, number> = {
  'あ':3,'い':2,'う':2,'え':2,'お':3,
  'か':3,'き':4,'く':1,'け':3,'こ':2,
  'さ':3,'し':1,'す':2,'せ':3,'そ':1,
  'た':4,'ち':2,'つ':1,'て':1,'と':2,
  'な':4,'に':3,'ぬ':2,'ね':2,'の':1,
  'は':3,'ひ':1,'ふ':4,'へ':1,'ほ':4,
  'ま':3,'み':2,'む':3,'め':2,'も':3,
  'や':3,'ゆ':2,'よ':2,
  'ら':2,'り':2,'る':1,'れ':2,'ろ':1,
  'わ':2,'を':3,'ん':1,
  'が':5,'ぎ':6,'ぐ':3,'げ':5,'ご':4,
  'ざ':5,'じ':3,'ず':4,'ぜ':5,'ぞ':3,
  'だ':6,'ぢ':4,'づ':3,'で':3,'ど':4,
  'ば':5,'び':3,'ぶ':6,'べ':3,'ぼ':6,
  'ぱ':4,'ぴ':2,'ぷ':5,'ぺ':2,'ぽ':5,
  'っ':1,'ゃ':3,'ゅ':2,'ょ':2,
};

// カタカナの画数
export const KATAKANA_STROKES: Record<string, number> = {
  'ア':2,'イ':2,'ウ':3,'エ':3,'オ':3,
  'カ':2,'キ':3,'ク':2,'ケ':3,'コ':2,
  'サ':3,'シ':3,'ス':2,'セ':2,'ソ':2,
  'タ':3,'チ':3,'ツ':3,'テ':3,'ト':2,
  'ナ':2,'ニ':2,'ヌ':2,'ネ':4,'ノ':1,
  'ハ':2,'ヒ':2,'フ':1,'ヘ':1,'ホ':4,
  'マ':2,'ミ':3,'ム':2,'メ':2,'モ':3,
  'ヤ':2,'ユ':2,'ヨ':3,
  'ラ':2,'リ':2,'ル':2,'レ':1,'ロ':3,
  'ワ':2,'ヲ':3,'ン':2,
  'ガ':4,'ギ':5,'グ':4,'ゲ':5,'ゴ':4,
  'ザ':5,'ジ':5,'ズ':4,'ゼ':4,'ゾ':4,
  'ダ':5,'ヂ':5,'ヅ':5,'デ':5,'ド':4,
  'バ':4,'ビ':4,'ブ':3,'ベ':3,'ボ':6,
  'パ':3,'ピ':3,'プ':2,'ペ':2,'ポ':5,
  'ッ':3,'ャ':2,'ュ':2,'ョ':3,'ー':1,
};

/**
 * 1文字の画数を取得
 */
export function getCharStrokes(char: string): number | null {
  return KANJI_STROKES[char] ?? HIRAGANA_STROKES[char] ?? KATAKANA_STROKES[char] ?? null;
}
`;

  const outPath = path.join(__dirname, '..', 'src', 'data', 'kanji-strokes.ts');
  fs.writeFileSync(outPath, output, 'utf8');
  console.log(`✅ ${outPath} に ${strokes.size} 文字を書き出しました`);

  // クリーンアップ
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log('一時ファイルを削除しました');
}

main().catch((err) => {
  console.error('エラー:', err);
  process.exit(1);
});
