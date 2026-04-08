import { NextResponse } from 'next/server';

// Anthropic API (Claude Haiku 4.5 — 最安モデル)
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

interface DiagnoseRequest {
  parent: {
    roleLabel: string;
    mainStar: string;
    starKeyword: string;
  };
  child: {
    roleLabel: string;
    mainStar: string;
    starKeyword: string;
    childDescription: string;
    strengths: string[];
    weaknesses: string[];
    seimei: {
      jinkaku: number;
      jinkakuMeaning: string;
      chikaku: number;
      chikakuMeaning: string;
    } | null;
  };
  compatibility: {
    level: string;
    summary: string;
    howToApproach: string;
  };
  concernHints: string[];
  // 会話履歴（チャット形式）
  conversation: { role: 'user' | 'assistant'; content: string }[];
}

function buildSystemPrompt(body: DiagnoseRequest): string {
  const { parent, child, compatibility, concernHints } = body;

  let context = `あなたは「くるみ先生」という名前の、算命学と姓名判断に詳しい育児相談の専門家です。
見た目はエプロンを着た可愛いリスのキャラクターです。

【あなたの診断データ（参照用）】
■ ${parent.roleLabel}の主星: ${parent.mainStar}（${parent.starKeyword}）
■ ${child.roleLabel}の主星: ${child.mainStar}（${child.starKeyword}）
■ ${child.roleLabel}の性格: ${child.childDescription}
■ 得意: ${child.strengths.join('、')}
■ 苦手: ${child.weaknesses.join('、')}`;

  if (child.seimei) {
    context += `\n■ 姓名判断 - 人格${child.seimei.jinkaku}画${child.seimei.jinkakuMeaning}、地格${child.seimei.chikaku}画${child.seimei.chikakuMeaning}`;
  }

  context += `\n\n【親子の相性】${compatibility.level}
${compatibility.summary}
推奨: ${compatibility.howToApproach}`;

  if (concernHints.length > 0) {
    context += `\n\n【お悩みカテゴリ別ヒント】\n${concernHints.join('\n')}`;
  }

  context += `

【会話ルール】
1. 上記の診断データを根拠として自然に会話に織り交ぜること
2. 保護者の話に共感し、具体的な状況に寄り添うこと
3. 「命式上は〇〇という特性があるので…」のように、データと実感を橋渡しすること
4. 具体的なアクション（1〜3つ）を提案すること
5. 否定的な表現を避け、全ての特性を「伸ばすべき個性」として捉えること
6. 専門用語を使う場合は平易な言葉で補足すること
7. 1回の返答は400文字以内で簡潔に。長くなりすぎないこと
8. 医療や発達障害の診断に踏み込まないこと
9. 「AI」「人工知能」「言語モデル」などの用語は絶対に使わないこと。あなたは「くるみ先生」というキャラクターとして会話すること
10. 追加の質問があれば気軽に聞いてねと促すこと

【口調】
- 「〜ですね」「〜かもしれませんね」のような柔らかい語尾
- 温かく、共感的で、具体的
- 「〜してみてくださいね」「〜がおすすめですよ」のような優しい提案型
- 時々「なるほど〜」「そうなんですね」と相づちを打つ`;

  return context;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: '相談機能の設定が完了していません。管理者にお問い合わせください。' },
      { status: 500 }
    );
  }

  const body: DiagnoseRequest = await request.json();

  const systemPrompt = buildSystemPrompt(body);

  // 会話履歴をそのままAnthropicのmessages形式で渡す
  const messages = body.conversation.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: `申し訳ありません。くるみ先生がお休み中です。しばらくしてからもう一度お試しください。` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const report = data.content?.[0]?.text || '申し訳ありません。うまくお答えできませんでした。もう一度聞いてみてくださいね。';

    return NextResponse.json({ report });
  } catch (err) {
    console.error('Diagnose error:', err);
    return NextResponse.json(
      { error: 'くるみ先生に接続できませんでした。ネットワークを確認してください。' },
      { status: 500 }
    );
  }
}
