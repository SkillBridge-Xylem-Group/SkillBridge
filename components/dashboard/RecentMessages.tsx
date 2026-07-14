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
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Recent Messages</h2>
        <Link href="/dashboard/messages" className="text-sm font-bold text-brand hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {!loading && threads.length === 0 && (
          <p className="text-sm text-slate-500">No conversations yet — message someone from their profile.</p>
        )}
        {threads.map((t) => (
          <Link key={t.thread_id} href={`/dashboard/messages/${t.thread_id}`} className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
              {getInitials(t.partner.fullname)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{t.partner.fullname}</p>
                {t.lastMessage && (
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(t.lastMessage.sent_at)}</span>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">{t.lastMessage?.content ?? "Say hello!"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
