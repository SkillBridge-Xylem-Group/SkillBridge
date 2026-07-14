"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/messages";

type ChatPaneProps = {
  threadId: string;
  viewerId: string;
  partner: { id: string; fullname: string };
  initialMessages: MessageRow[];
};

export default function ChatPane({ threadId, viewerId, partner, initialMessages }: ChatPaneProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const incoming = payload.new as MessageRow;
          setMessages((prev) =>
            prev.some((m) => m.message_id === incoming.message_id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setDraft("");
    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        // A poll tick can land between the send resolving and this callback running,
        // and may already include this message — avoid appending a duplicate.
        setMessages((prev) =>
          prev.some((m) => m.message_id === data.message.message_id) ? prev : [...prev, data.message]
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
          {getInitials(partner.fullname)}
        </div>
        <p className="text-sm font-bold text-slate-900">{partner.fullname}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">Say hello to {partner.fullname.split(" ")[0]}!</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === viewerId;
            return (
              <div key={m.message_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-brand text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 p-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand/50"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
