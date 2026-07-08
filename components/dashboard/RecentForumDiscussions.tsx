"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, MessageCircle, ArrowBigUp } from "lucide-react";

type RecentQuestion = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  replyCount: number;
  upvotes?: number;
};

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
            upvotes: question.upvotes ?? 0,
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
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Recent Forum Discussions</h2>
        <a href="/dashboard/forum" className="text-sm font-bold text-brand hover:underline">
          View all
        </a>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <MessageSquareText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-600">{error}</div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <MessageSquareText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{question.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Asked by {question.authorName} · {new Date(question.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} /> {question.replyCount}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowBigUp size={14} /> {question.upvotes}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
