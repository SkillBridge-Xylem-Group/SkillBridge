"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import type { ForumQuestionSummary } from "@/lib/forum";
import { getForumSubforum } from "@/lib/forumSubforums";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function TrendingTopics({
  questions,
  showSubforum = true,
}: {
  questions: ForumQuestionSummary[];
  showSubforum?: boolean;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;

  const trending = questions
    .filter((q) => q.answer_count > 0)
    .slice()
    .sort((a, b) => b.answer_count - a.answer_count)
    .slice(0, 3);

  return (
    <div className="nb-card p-6">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold nb-heading">
        {f.trendingTopics} <Flame size={16} className="text-amber-500" />
      </h2>

      {trending.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--sb-muted)" }}>{f.noTrending}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {trending.map((q, i) => {
            const sub = getForumSubforum(q.subforum_slug);
            return (
              <Link key={q.question_id} href={`/dashboard/forum/${q.question_id}`} className="flex items-start gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: "var(--sb-gradient)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold leading-snug" style={{ color: "var(--sb-ink)" }}>{q.title}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--sb-muted)" }}>
                    {showSubforum ? (
                      <>
                        <span className="font-semibold" style={{ color: "var(--sb-teal-dark)" }}>{sub.title}</span>
                        {" · "}
                      </>
                    ) : null}
                    {q.answer_count} {q.answer_count === 1 ? f.reply : f.replies}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
