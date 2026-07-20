"use client";

import Link from "next/link";
import type { ForumQuestionSummary } from "@/lib/forum";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

export default function CommunityTrendingCard({
  communityTitle,
  questions,
}: {
  communityTitle: string;
  questions: ForumQuestionSummary[];
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const trending = questions
    .filter((q) => q.answer_count > 0)
    .slice()
    .sort((a, b) => b.answer_count - a.answer_count)
    .slice(0, 3);

  if (trending.length === 0) return null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold text-slate-900">
          {interpolate(f.trendingIn, { title: communityTitle })}
        </h2>
        <ul className="mt-3 space-y-3">
          {trending.map((q) => (
            <li key={q.question_id}>
              <Link
                href={`/dashboard/forum/${q.question_id}`}
                className="text-sm font-semibold text-slate-800 hover:text-brand"
              >
                {q.title}
              </Link>
              <p className="text-xs text-slate-400">
                {q.answer_count} {q.answer_count === 1 ? f.reply : f.replies}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
