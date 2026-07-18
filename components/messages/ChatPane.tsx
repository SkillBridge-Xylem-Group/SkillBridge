"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { formatMessageTime, getInitials } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteThreadAction } from "@/lib/actions/messages";
import EmojiPicker from "./EmojiPicker";
import type { MessageRow } from "@/lib/messages";

type ChatPaneProps = {
  threadId: string;
  viewerId: string;
  partner: { id: string; fullname: string; slug?: string };
  initialMessages: MessageRow[];
};

export default function ChatPane({ threadId, viewerId, partner, initialMessages }: ChatPaneProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
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
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const removedId = (payload.old as { message_id?: string }).message_id;
          if (!removedId) return;
          setMessages((prev) => prev.filter((m) => m.message_id !== removedId));
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

  function handleDelete() {
    if (!window.confirm(`Delete this conversation with ${partner.fullname}? This can't be undone.`)) return;
    setDeleteError("");
    startDeleteTransition(async () => {
      const result = await deleteThreadAction(threadId);
      if (result?.error) setDeleteError(result.error);
      // On success, deleteThreadAction redirects to /dashboard/messages itself.
    });
  }

  async function handleDeleteMessage(messageId: string) {
    if (!window.confirm("Delete this message?")) return;
    setDeletingMessageId(messageId);
    try {
      const res = await fetch(`/api/messages/${threadId}/${messageId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.message_id !== messageId));
      }
    } finally {
      setDeletingMessageId(null);
    }
  }

  const firstName = partner.fullname.split(" ")[0] || partner.fullname;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5" style={{ borderBottom: "1px solid #eef7f0" }}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/messages"
            aria-label="Back to conversations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-100 active:scale-95 md:hidden"
            style={{ color: "var(--sb-muted)" }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div
            className="nb-avatar flex h-10 w-10 shrink-0 items-center justify-center text-sm"
            style={{ background: "var(--sb-gradient)", color: "#fff" }}
          >
            {getInitials(partner.fullname)}
          </div>
          <div className="min-w-0">
            {partner.slug ? (
              <Link
                href={`/dashboard/profile/${partner.slug}`}
                className="block truncate text-sm font-semibold hover:underline"
                style={{ color: "var(--sb-ink)" }}
              >
                {partner.fullname}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>{partner.fullname}</p>
            )}
            <p className="text-xs" style={{ color: "var(--sb-muted)" }}>Direct message</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete conversation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          style={{ color: "var(--sb-muted)" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {deleteError && <p className="bg-white px-4 pt-2 text-xs font-medium text-red-600">{deleteError}</p>}

      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className="nb-avatar mb-3 flex h-12 w-12 items-center justify-center"
              style={{ background: "var(--sb-gradient)", color: "#fff" }}
            >
              {getInitials(partner.fullname)}
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>Say hello to {firstName}</p>
            <p className="mt-1 max-w-xs text-xs" style={{ color: "var(--sb-muted)" }}>
              This is the beginning of your conversation. Send a note to get the swap started.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === viewerId;
            return (
              <div
                key={m.message_id}
                className={`group flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}
              >
                {mine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m.message_id)}
                    disabled={deletingMessageId === m.message_id}
                    aria-label="Delete message"
                    className="mb-1 opacity-0 transition group-hover:opacity-100 hover:text-red-500 disabled:opacity-50"
                    style={{ color: "var(--sb-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className={`max-w-[min(75%,22rem)] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className="break-words px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      mine
                        ? { borderRadius: "20px 20px 6px 20px", background: "var(--sb-gradient)", color: "#fff" }
                        : { borderRadius: "20px 20px 20px 6px", background: "#f3f4f6", color: "var(--sb-ink)" }
                    }
                  >
                    {m.content}
                  </div>
                  <span className="mt-1 px-1 text-[10px]" style={{ color: "var(--sb-muted)" }}>
                    {formatMessageTime(m.sent_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 lg:pb-4"
        style={{ borderTop: "1px solid #eef7f0" }}
      >
        <div className="nb-input flex items-center gap-2 px-2 py-1.5">
          <EmojiPicker onSelect={(emoji) => setDraft((prev) => prev + emoji)} />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${firstName}...`}
            maxLength={2000}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
            style={{ color: "var(--sb-ink)" }}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-45"
            style={{ background: "var(--sb-gradient)" }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
