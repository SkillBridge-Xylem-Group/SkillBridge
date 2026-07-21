"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";
import type { ThreadSummary } from "@/lib/messages";

export default function RecentMessages() {
  const { locale, dictionary } = useLocale();
  const h = dictionary.home;
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/messages");
        if (!res.ok) return;
        const data = await res.json();
        setThreads((data.threads ?? []).slice(0, 3));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold nb-heading">{h.recentMessages}</h2>
        <Link href="/dashboard/messages" className="text-sm font-bold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
          {dictionary.common.viewAll}
        </Link>
      </div>

      <div className="mt-4">
        {!loading && threads.length === 0 && (
          <p className="text-sm" style={{ color: "var(--sb-muted)" }}>{h.noConversationsHint}</p>
        )}
        {threads.map((t, i) => (
          <Link
            key={t.thread_id}
            href={`/dashboard/messages/${t.partner.slug}`}
            className="flex items-center gap-3 py-2.5"
            style={i > 0 ? { borderTop: "1px solid #eef7f0" } : undefined}
          >
            <Avatar className="h-10 w-10">
              {t.partner.avatar_url && <AvatarImage src={t.partner.avatar_url} alt="" />}
              <AvatarFallback
                className="text-xs font-extrabold"
                style={{ background: "var(--sb-tint-violet-bg)", color: "var(--sb-tint-violet-ink)" }}
              >
                {getInitials(t.partner.fullname)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${t.unreadCount > 0 ? "font-extrabold" : "font-bold"}`} style={{ color: "var(--sb-ink)" }}>
                {t.partner.fullname}
              </p>
              <p
                className={`truncate text-xs ${t.unreadCount > 0 ? "font-semibold" : "font-medium"}`}
                style={{ color: t.unreadCount > 0 ? "var(--sb-ink)" : "var(--sb-muted)" }}
              >
                {t.lastMessage?.content ?? h.sayHello}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {t.lastMessage && (
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: t.unreadCount > 0 ? "var(--sb-emerald-dark)" : "var(--sb-muted)" }}
                >
                  {formatRelativeTimeLabel(t.lastMessage.sent_at, dictionary.common, locale)}
                </span>
              )}
              {t.unreadCount > 0 ? (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                  style={{ background: "var(--sb-emerald)" }}
                >
                  {t.unreadCount > 9 ? "9+" : t.unreadCount}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
