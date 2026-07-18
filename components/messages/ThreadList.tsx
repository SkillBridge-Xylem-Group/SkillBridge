"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { ThreadSummary } from "@/lib/messages";

export default function ThreadList({ threads }: { threads: ThreadSummary[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => {
      const haystack = `${t.partner.fullname} ${t.lastMessage?.content ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [threads, query]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: "#fbfffc" }}>
      <div className="px-4 pb-3 pt-4" style={{ borderBottom: "1px solid #eef7f0" }}>
        <div className="mb-3">
          <h1 className="text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>Messages</h1>
        </div>
        <label className="relative block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--sb-muted)" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="nb-input w-full py-2.5 pl-9 pr-3 text-sm"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white"
              style={{ boxShadow: "var(--sb-shadow-sm)", color: "var(--sb-muted)" }}
            >
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>No conversations yet</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--sb-muted)" }}>
              Visit someone&apos;s profile and tap Message to start chatting.
            </p>
            <Link href="/dashboard/browse-people" className="nb-btn mt-4 px-4 py-2 text-xs text-white" style={{ background: "var(--sb-gradient)" }}>
              Browse people
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--sb-muted)" }}>No chats match "{query.trim()}".</p>
        ) : (
          <ul className="space-y-0.5 p-2">
            {filtered.map((t) => {
              const active = pathname === `/dashboard/messages/${t.partner.slug}`;
              const preview = t.lastMessage?.content?.trim() || "Say hello!";
              return (
                <li key={t.thread_id}>
                  <Link
                    href={`/dashboard/messages/${t.partner.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition active:scale-[0.99]"
                    style={active ? { background: "var(--sb-emerald-light)" } : undefined}
                  >
                    <div
                      className="nb-avatar flex h-11 w-11 shrink-0 items-center justify-center text-sm"
                      style={{ background: "var(--sb-gradient)", color: "#fff" }}
                    >
                      {getInitials(t.partner.fullname)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>{t.partner.fullname}</p>
                        {t.lastMessage?.sent_at && (
                          <span className="shrink-0 text-[11px]" style={{ color: "var(--sb-muted)" }}>
                            {formatRelativeTime(t.lastMessage.sent_at)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs leading-snug" style={{ color: "var(--sb-muted)" }}>
                        {preview}
                      </p>
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
