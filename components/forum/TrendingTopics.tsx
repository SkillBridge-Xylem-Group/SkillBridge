import Link from "next/link";
import { Flame } from "lucide-react";
import type { ForumQuestionSummary } from "@/lib/forum";
import { getForumSubforum } from "@/lib/forumSubforums";

export default function TrendingTopics({
  questions,
  showSubforum = true,
}: {
  questions: ForumQuestionSummary[];
  showSubforum?: boolean;
}) {
  const trending = questions
    .filter((q) => q.answer_count > 0)
    .slice()
    .sort((a, b) => b.answer_count - a.answer_count)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
        Trending Topics <Flame size={16} className="text-amber-500" />
      </h2>

      {trending.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No trending discussions yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {trending.map((q, i) => {
            const sub = getForumSubforum(q.subforum_slug);
            return (
              <Link key={q.question_id} href={`/dashboard/forum/${q.question_id}`} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold leading-snug text-slate-900 hover:text-brand">{q.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {showSubforum ? (
                      <>
                        <span className="font-semibold text-brand">{sub.title}</span>
                        {" · "}
                      </>
                    ) : null}
                    {q.answer_count} {q.answer_count === 1 ? "reply" : "replies"}
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
