"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Send, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteThreadAction } from "@/lib/actions/messages";
import EmojiPicker from "./EmojiPicker";
import type { MessageRow } from "@/lib/messages";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { dateLocaleTag, formatAppTime, type AppLocale } from "@/lib/i18n/locales";

type ChatPaneProps = {
  threadId: string;
  viewerId: string;
  partner: { id: string; fullname: string; slug?: string; avatar_url?: string | null };
  initialMessages: MessageRow[];
};

type PendingDelete =
  | { type: "thread" }
  | { type: "message"; messageId: string };

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayLabel(
  iso: string,
  locale: AppLocale,
  labels: { today: string; yesterday: string }
) {
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startMsg.getTime()) / 86_400_000);
  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;
  return date.toLocaleDateString(dateLocaleTag(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function ChatPane({ threadId, viewerId, partner, initialMessages }: ChatPaneProps) {
  const { locale, dictionary } = useLocale();
  const msg = dictionary.messages;
  const c = dictionary.common;
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, threadId]);

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
        setMessages((prev) =>
          prev.some((m) => m.message_id === data.message.message_id) ? prev : [...prev, data.message]
        );
      }
    } finally {
      setSending(false);
    }
  }

  function confirmPendingDelete() {
    if (!pendingDelete) return;

    if (pendingDelete.type === "thread") {
      setDeleteError("");
      startDeleteTransition(async () => {
        const result = await deleteThreadAction(threadId);
        if (result?.error) {
          setDeleteError(result.error);
          setPendingDelete(null);
        }
      });
      return;
    }

    const messageId = pendingDelete.messageId;
    setPendingDelete(null);
    setDeletingMessageId(messageId);
    void (async () => {
      try {
        const res = await fetch(`/api/messages/${threadId}/${messageId}`, { method: "DELETE" });
        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m.message_id !== messageId));
        }
      } finally {
        setDeletingMessageId(null);
      }
    })();
  }

  const firstName = partner.fullname.split(" ")[0] || partner.fullname;
  const confirmBusy = pendingDelete?.type === "thread" ? isDeleting : false;

  const rows = useMemo(() => {
    const out: Array<
      | { kind: "day"; key: string; label: string }
      | { kind: "msg"; message: MessageRow; showAvatar: boolean }
    > = [];
    let lastDay = "";
    messages.forEach((m, i) => {
      const key = dayKey(m.sent_at);
      if (key !== lastDay) {
        lastDay = key;
        out.push({
          kind: "day",
          key,
          label: formatDayLabel(m.sent_at, locale, { today: msg.today, yesterday: msg.yesterday }),
        });
      }
      const next = messages[i + 1];
      const showAvatar =
        m.sender_id !== viewerId &&
        (!next || next.sender_id === viewerId || dayKey(next.sent_at) !== key);
      out.push({ kind: "msg", message: m, showAvatar });
    });
    return out;
  }, [messages, viewerId, locale, msg.today, msg.yesterday]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div
        className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
        style={{ background: "#f7fcf9", borderBottom: "1px solid #e8f3ec" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/dashboard/messages"
            aria-label={msg.backToConversations}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/80 active:scale-95 md:hidden"
            style={{ color: "var(--sb-muted)" }}
          >
            <ArrowLeft size={18} />
          </Link>
          <Avatar className="h-10 w-10 text-sm">
            {partner.avatar_url ? <AvatarImage src={partner.avatar_url} alt="" /> : null}
            <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
              {getInitials(partner.fullname)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            {partner.slug ? (
              <Link
                href={`/dashboard/profile/${partner.slug}`}
                className="block truncate text-[15px] font-semibold hover:underline"
                style={{ color: "var(--sb-ink)" }}
              >
                {partner.fullname}
              </Link>
            ) : (
              <p className="truncate text-[15px] font-semibold" style={{ color: "var(--sb-ink)" }}>
                {partner.fullname}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--sb-muted)" }}>
              {msg.directMessage}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPendingDelete({ type: "thread" })}
          disabled={isDeleting}
          aria-label={msg.deleteConversation}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          style={{ color: "var(--sb-muted)" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {deleteError ? (
        <p className="bg-white px-4 pt-2 text-xs font-medium text-red-600">{deleteError}</p>
      ) : null}

      <div className="sb-chat-wallpaper flex-1 space-y-1 overflow-y-auto px-3 py-3 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Avatar className="mb-3 h-16 w-16 text-lg shadow-sm">
              {partner.avatar_url ? <AvatarImage src={partner.avatar_url} alt="" /> : null}
              <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
                {getInitials(partner.fullname)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
              {interpolate(msg.sayHelloTo, { name: firstName })}
            </p>
            <p className="mt-1 max-w-xs text-xs" style={{ color: "var(--sb-muted)" }}>
              {msg.conversationStart}
            </p>
          </div>
        ) : (
          rows.map((row) => {
            if (row.kind === "day") {
              return (
                <div key={`day-${row.key}`} className="flex justify-center py-2">
                  <span className="sb-chat-date-pill">{row.label}</span>
                </div>
              );
            }

            const m = row.message;
            const mine = m.sender_id === viewerId;
            return (
              <div
                key={m.message_id}
                className={`group flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"} ${
                  row.showAvatar || mine ? "mt-1.5" : "mt-0.5"
                }`}
              >
                {!mine ? (
                  <div className="mb-0.5 w-7 shrink-0">
                    {row.showAvatar ? (
                      <Avatar className="h-7 w-7 text-[10px]">
                        {partner.avatar_url ? <AvatarImage src={partner.avatar_url} alt="" /> : null}
                        <AvatarFallback
                          className="font-bold text-white"
                          style={{ background: "var(--sb-gradient)" }}
                        >
                          {getInitials(partner.fullname)}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                ) : null}

                {mine ? (
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ type: "message", messageId: m.message_id })}
                    disabled={deletingMessageId === m.message_id}
                    aria-label={msg.deleteMessage}
                    className="mb-1 opacity-0 transition group-hover:opacity-100 hover:text-red-500 disabled:opacity-50"
                    style={{ color: "var(--sb-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}

                <div className={`sb-chat-bubble ${mine ? "sb-chat-bubble-mine" : "sb-chat-bubble-theirs"}`}>
                  <span className="sb-chat-bubble-body">{m.content}</span>
                  <span className="sb-chat-meta">
                    {formatAppTime(m.sent_at, locale)}
                    {mine ? <Check size={12} strokeWidth={2.5} aria-hidden /> : null}
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
        className="px-2.5 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3 sm:py-2.5"
        style={{ background: "#f7fcf9", borderTop: "1px solid #e8f3ec" }}
      >
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-[1.5rem] bg-white px-2 py-1 shadow-sm">
            <EmojiPicker onSelect={(emoji) => setDraft((prev) => prev + emoji)} />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={interpolate(msg.messagePlaceholder, { name: firstName })}
              maxLength={2000}
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm outline-none"
              style={{ color: "var(--sb-ink)" }}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:brightness-105 active:scale-95 disabled:opacity-45"
            style={{ background: "var(--sb-gradient)", boxShadow: "var(--sb-shadow-sm)" }}
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === "thread" ? msg.deleteConversation : msg.deleteMessage}
        description={
          pendingDelete?.type === "thread"
            ? interpolate(msg.deleteConversationConfirm, { name: partner.fullname })
            : msg.deleteMessageConfirm
        }
        confirmLabel={c.delete}
        cancelLabel={c.cancel}
        danger
        busy={confirmBusy}
        onConfirm={confirmPendingDelete}
        onCancel={() => {
          if (!confirmBusy) setPendingDelete(null);
        }}
      />
    </div>
  );
}
