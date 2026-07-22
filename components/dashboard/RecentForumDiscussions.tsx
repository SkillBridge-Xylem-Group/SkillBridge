"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareText, MessageCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";
import ForumAuthorAvatar from "@/components/forum/ForumAuthorAvatar";

type RecentQuestion = {
  id: string;
  title: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  replyCount: number;
  imageUrl: string | null;
  subforumTitle: string | null;
};

export default function RecentForumDiscussions() {
  const { locale, dictionary } = useLocale();
  const h = dictionary.home;
  const [questions, setQuestions] = useState<RecentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
            authorName: question.author_name ?? "",
            authorAvatarUrl: question.author_avatar_url ?? null,
            createdAt: question.created_at,
            replyCount: question.reply_count ?? 0,
            imageUrl: question.image_url ?? null,
            subforumTitle: question.subforum_title ?? null,
          }))
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  return (
    <div className="nb-card p-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "var(--sb-muted)" }}>{h.recentDiscussions}</h2>
        <Link href="/dashboard/forum" className="text-sm font-bold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
          {dictionary.common.viewAll}
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
          <div className="py-6 text-center text-sm text-red-600">{h.loadDiscussionsFailed}</div>
        ) : questions.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">{h.noDiscussions}</div>
        ) : (
          questions.map((question, index) => (
            <Link
              key={question.id}
              href={`/dashboard/forum/${question.id}`}
              className="block rounded-xl px-2 py-3 transition hover:bg-slate-50"
              style={index > 0 ? { borderTop: "2px solid #f0ecfa" } : undefined}
            >
              <div className="flex items-center gap-2">
                <ForumAuthorAvatar
                  name={question.authorName || "?"}
                  avatarUrl={question.authorAvatarUrl}
                  className="h-5 w-5 shrink-0"
                  textClassName="text-[9px]"
                />
                <p className="min-w-0 truncate text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                  {question.subforumTitle ? (
                    <>
                      <span style={{ color: "var(--sb-teal-dark)" }}>{question.subforumTitle}</span>
                      <span className="font-normal"> · </span>
                    </>
                  ) : null}
                  {question.authorName || dictionary.common.unknown}
                  <span className="font-normal"> · {formatRelativeTimeLabel(question.createdAt, dictionary.common, locale)}</span>
                </p>
              </div>

              <div className="mt-1.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{question.title}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                    <MessageCircle size={13} />
                    {question.replyCount} {question.replyCount === 1 ? h.reply : h.replies}
                  </p>
                </div>

                {question.imageUrl ? (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={question.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)" }}
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
