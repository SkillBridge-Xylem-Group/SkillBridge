"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareText, MessageCircle } from "lucide-react";

type RecentQuestion = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  replyCount: number;
  imageUrl: string | null;
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function RecentForumDiscussions() {
  const [questions, setQuestions] = useState<RecentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch("/api/forum/recent-questions");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load recent forum questions");
        }

        setQuestions(
          (data.questions ?? []).map((question: any) => ({
            id: question.id,
            title: question.title,
            authorName: question.author_name ?? "Unknown",
            createdAt: question.created_at,
            replyCount: question.reply_count ?? 0,
            imageUrl: question.image_url ?? null,
          }))
        );
      } catch (err: any) {
        setError(err?.message ?? "Unable to load questions");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  return (
    <div className="nb-card p-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "var(--neu-text-muted)" }}>Recent Discussions</h2>
        <Link href="/dashboard/forum" className="text-sm font-bold hover:underline" style={{ color: "var(--neu-indigo)" }}>
          View all
        </Link>
      </div>

      <div className="mt-2 space-y-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl px-2 py-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-2 flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-600">{error}</div>
        ) : questions.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">No discussions yet.</div>
        ) : (
          questions.map((question, index) => (
            <Link
              key={question.id}
              href={`/dashboard/forum/${question.id}`}
              className="block rounded-xl px-2 py-3 transition hover:bg-slate-50"
              style={index > 0 ? { borderTop: "2px solid #f0ecfa" } : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: "var(--neu-indigo)" }}
                >
                  {initials(question.authorName)}
                </span>
                <p className="min-w-0 truncate text-xs font-semibold" style={{ color: "var(--neu-text-muted)" }}>
                  {question.authorName}
                  <span className="font-normal"> · {formatRelativeTime(question.createdAt)}</span>
                </p>
              </div>

              <div className="mt-1.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold" style={{ color: "var(--neu-ink)" }}>{question.title}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--neu-text-muted)" }}>
                    <MessageCircle size={13} />
                    {question.replyCount} {question.replyCount === 1 ? "comment" : "comments"}
                  </p>
                </div>

                {question.imageUrl ? (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ border: "2px solid var(--neu-ink)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={question.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ background: "var(--neu-purple)", border: "2px solid var(--neu-ink)" }}
                  >
                    <MessageSquareText size={20} />
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
