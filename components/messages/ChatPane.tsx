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
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/messages"
            aria-label="Back to conversations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:scale-95 md:hidden"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
            {getInitials(partner.fullname)}
          </div>
          <div className="min-w-0">
            {partner.slug ? (
              <Link
                href={`/dashboard/profile/${partner.slug}`}
                className="block truncate text-sm font-semibold text-slate-900 hover:text-brand"
              >
                {partner.fullname}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold text-slate-900">{partner.fullname}</p>
            )}
            <p className="text-xs text-slate-500">Direct message</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete conversation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {deleteError && <p className="bg-white px-4 pt-2 text-xs font-medium text-red-600">{deleteError}</p>}

      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-slate-100">
              {getInitials(partner.fullname)}
            </div>
            <p className="text-sm font-semibold text-slate-800">Say hello to {firstName}</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
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
                    className="mb-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className={`max-w-[min(75%,22rem)] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`break-words px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      mine
                        ? "rounded-2xl rounded-br-md bg-brand text-white"
                        : "rounded-2xl rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-100"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className={`mt-1 px-1 text-[10px] text-slate-400 ${mine ? "text-right" : "text-left"}`}>
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
        className="border-t border-slate-200/80 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 lg:pb-4"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-2 py-1.5 focus-within:border-brand/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10">
          <EmojiPicker onSelect={(emoji) => setDraft((prev) => prev + emoji)} />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${firstName}...`}
            maxLength={2000}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark active:scale-95 disabled:opacity-45"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
