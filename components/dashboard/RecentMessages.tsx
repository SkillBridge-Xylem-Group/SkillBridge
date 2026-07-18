"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import type { ThreadSummary } from "@/lib/messages";

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentMessages() {
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
        <h2 className="text-lg font-extrabold nb-heading">Recent Messages</h2>
        <Link href="/dashboard/messages" className="text-sm font-bold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
          View all
        </Link>
      </div>

      <div className="mt-4">
        {!loading && threads.length === 0 && (
          <p className="text-sm" style={{ color: "var(--sb-muted)" }}>No conversations yet — message someone from their profile.</p>
        )}
        {threads.map((t, i) => (
          <Link
            key={t.thread_id}
            href={`/dashboard/messages/${t.partner.slug}`}
            className="flex items-center gap-3 py-2.5"
            style={i > 0 ? { borderTop: "1px solid #eef7f0" } : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold" style={{ background: "var(--sb-tint-violet-bg)", color: "var(--sb-tint-violet-ink)" }}>
              {getInitials(t.partner.fullname)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{t.partner.fullname}</p>
              <p className="truncate text-xs font-medium" style={{ color: "var(--sb-muted)" }}>{t.lastMessage?.content ?? "Say hello!"}</p>
            </div>
            {t.lastMessage && (
              <span className="shrink-0 text-[11px] font-semibold" style={{ color: "var(--sb-muted)" }}>{timeAgo(t.lastMessage.sent_at)}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
