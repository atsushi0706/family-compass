'use client';

import { useState, useRef, useEffect } from 'react';
import type { FamilyMember } from '@/lib/types';
import type { CompatibilityAdvice } from '@/data/compatibility-matrix';
import KurumiIcon from './KurumiIcon';

interface Props {
  parent: FamilyMember;
  child: FamilyMember;
  compatibility: CompatibilityAdvice;
  concernHints: { concernLabel: string; hint: string }[];
}

interface ChatMessage {
  role: 'user' | 'kurumi';
  text: string;
}

export default function AIFeedback({ parent, child, compatibility, concernHints }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 会話履歴をAPI用に変換
  const buildConversationHistory = (newUserMessage: string) => {
    const history = messages.map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.text,
    }));
    history.push({ role: 'user', content: newUserMessage });
    return history;
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setStarted(true);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent: {
            roleLabel: parent.roleLabel,
            mainStar: parent.sanmeigaku?.mainStar,
            starKeyword: parent.sanmeigaku?.starInfo.keyword,
          },
          child: {
            roleLabel: child.roleLabel,
            mainStar: child.sanmeigaku?.mainStar,
            starKeyword: child.sanmeigaku?.starInfo.keyword,
            childDescription: child.sanmeigaku?.starInfo.childDescription,
            strengths: child.sanmeigaku?.starInfo.strengths,
            weaknesses: child.sanmeigaku?.starInfo.weaknesses,
            seimei: child.seimei ? {
              jinkaku: child.seimei.jinkaku,
              jinkakuMeaning: child.seimei.jinkakuMeaning,
              chikaku: child.seimei.chikaku,
              chikakuMeaning: child.seimei.chikakuMeaning,
            } : null,
          },
          compatibility: {
            level: compatibility.compatibility,
            summary: compatibility.summary,
            howToApproach: compatibility.howToApproach,
          },
          concernHints: concernHints.map(h => `${h.concernLabel}: ${h.hint}`),
          conversation: buildConversationHistory(text),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '相談に失敗しました');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'kurumi', text: data.report }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-md overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-3 flex items-center gap-3 border-b border-orange-200">
        <KurumiIcon size={40} />
        <div>
          <p className="font-bold text-orange-800 text-sm">くるみ先生の育児相談室</p>
          <p className="text-xs text-orange-600">診断結果をもとに、あなたの家族に合ったアドバイスをお届けします</p>
        </div>
      </div>

      {/* チャットエリア */}
      <div className="px-4 py-3 space-y-3 max-h-[500px] overflow-y-auto min-h-[200px]">
        {/* 初期メッセージ */}
        {!started && (
          <div className="flex gap-2 items-start">
            <div className="shrink-0 mt-1">
              <KurumiIcon size={32} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-orange-100 max-w-[85%]">
              <p className="text-sm text-gray-700 leading-relaxed">
                こんにちは！くるみ先生です。
                <br /><br />
                {parent.roleLabel}さんと{child.roleLabel}ちゃんの診断結果を見ました。
                お子さんの普段の様子や、気になっていることを教えてもらえますか？
                <br /><br />
                <span className="text-xs text-gray-500">
                  例：最近お友達とうまく遊べないみたい / 宿題をなかなかやりたがらなくて...
                </span>
              </p>
            </div>
          </div>
        )}

        {/* メッセージ一覧 */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'kurumi' && (
              <div className="shrink-0 mt-1">
                <KurumiIcon size={32} />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-sm'
                  : 'bg-white border border-orange-100 rounded-tl-sm'
              }`}
            >
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' ? 'text-white' : 'text-gray-700'
              }`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {/* ローディング */}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="shrink-0 mt-1">
              <KurumiIcon size={32} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-orange-100">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="bg-red-50 rounded-xl p-3 border border-red-200">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="px-4 pb-4 pt-2 border-t border-orange-100 bg-white/50">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={2}
            className="flex-1 px-4 py-2.5 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 text-sm resize-none disabled:opacity-50"
            placeholder="お子さんのことを教えてください..."
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Shift+Enter で改行 / Enter で送信
        </p>
      </div>
    </div>
  );
}
