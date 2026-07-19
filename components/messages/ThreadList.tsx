"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { ThreadSummary } from "@/lib/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

const THREAD_READ_EVENT = "sb-messages-thread-read";

export default function ThreadList({ threads }: { threads: ThreadSummary[] }) {
  const pathname = usePathname();
  const { locale, dictionary } = useLocale();
  const m = dictionary.messages;
  const [query, setQuery] = useState("");
  // Layout props stay stale across soft navigations — keep a local copy we can clear.
  const [items, setItems] = useState(threads);

  useEffect(() => {
    const activeSlug = pathname.startsWith("/dashboard/messages/")
      ? pathname.slice("/dashboard/messages/".length).split("/")[0]
      : "";

    setItems(
      threads.map((t) =>
        activeSlug && t.partner.slug === activeSlug ? { ...t, unreadCount: 0 } : t
      )
    );
  }, [threads, pathname]);

  useEffect(() => {
    function onThreadRead(e: Event) {
      const threadId = (e as CustomEvent<{ threadId?: string }>).detail?.threadId;
      if (!threadId) return;
      setItems((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, unreadCount: 0 } : t))
      );
    }
    window.addEventListener(THREAD_READ_EVENT, onThreadRead);
    return () => window.removeEventListener(THREAD_READ_EVENT, onThreadRead);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => {
      const haystack = `${t.partner.fullname} ${t.lastMessage?.content ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="px-4 pb-3 pt-4" style={{ borderBottom: "1px solid #e8f3ec" }}>
        <h1 className="mb-3 text-xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
          {m.title}
        </h1>
        <label className="relative block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--sb-muted)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={m.searchConversations}
            className="w-full rounded-full border-0 bg-[#f0f7f3] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[color-mix(in_srgb,var(--sb-emerald)_35%,transparent)]"
            style={{ color: "var(--sb-ink)" }}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f7f3]"
              style={{ color: "var(--sb-muted)" }}
            >
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
              {m.noConversations}
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--sb-muted)" }}>
              {m.noConversationsHint}
            </p>
            <Link
              href="/dashboard/browse-people"
              className="nb-btn mt-4 px-4 py-2 text-xs text-white"
              style={{ background: "var(--sb-gradient)" }}
            >
              {m.browsePeople}
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
            {interpolate(m.noChatsMatch, { q: query.trim() })}
          </p>
        ) : (
          <ul>
            {filtered.map((t) => {
              const active = pathname === `/dashboard/messages/${t.partner.slug}`;
              const preview = t.lastMessage?.content?.trim() || m.sayHello;
              const unread = t.unreadCount > 0;
              return (
                <li key={t.thread_id}>
                  <Link
                    href={`/dashboard/messages/${t.partner.slug}`}
                    className="flex items-center gap-3 px-3.5 py-3 transition active:scale-[0.995]"
                    style={{
                      background: active ? "var(--sb-emerald-light)" : undefined,
                      borderBottom: "1px solid #f3faf6",
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 text-sm">
                        {t.partner.avatar_url ? <AvatarImage src={t.partner.avatar_url} alt="" /> : null}
                        <AvatarFallback
                          className="font-bold text-white"
                          style={{ background: "var(--sb-gradient)" }}
                        >
                          {getInitials(t.partner.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      {unread ? (
                        <span
                          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white"
                          style={{ background: "var(--sb-emerald)" }}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-[15px] ${unread ? "font-extrabold" : "font-semibold"}`}
                          style={{ color: "var(--sb-ink)" }}
                        >
                          {t.partner.fullname}
                        </p>
                        {t.lastMessage?.sent_at ? (
                          <span
                            className={`shrink-0 text-[11px] font-semibold ${unread ? "" : "font-medium"}`}
                            style={{
                              color: unread || active ? "var(--sb-emerald-dark)" : "var(--sb-muted)",
                            }}
                          >
                            {formatRelativeTimeLabel(t.lastMessage.sent_at, dictionary.common, locale)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-[13px] leading-snug ${
                            unread ? "font-semibold" : ""
                          }`}
                          style={{ color: unread ? "var(--sb-ink)" : "var(--sb-muted)" }}
                        >
                          {preview}
                        </p>
                        {unread ? (
                          <span
                            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                            style={{ background: "var(--sb-emerald)" }}
                            aria-label={dictionary.common.unread}
                          >
                            {t.unreadCount > 9 ? "9+" : t.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
