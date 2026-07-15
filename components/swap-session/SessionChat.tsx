"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/hooks/useSwapWebRtc";

type Props = {
  messages: ChatMessage[];
  userId: string;
  partnerName: string;
  onSend: (text: string) => Promise<boolean>;
  disabled?: boolean;
};

export default function SessionChat({ messages, userId, partnerName, onSend, disabled }: Props) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending || disabled) return;
    setSending(true);
    const text = draft;
    setDraft("");
    try {
      const ok = await onSend(text);
      if (!ok) setDraft(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:min-h-0">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-extrabold text-slate-900">Session chat</h2>
        <p className="text-xs text-slate-500">Message {partnerName} while you swap</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">
            No messages yet. Say hi and start the skill swap.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.from === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-brand text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {m.fromName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                    {new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={disabled || sending}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={disabled || sending || !draft.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
