import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { ForumQuestionSummary } from "@/lib/forum";

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const AVATAR_COLORS = ["bg-brand", "bg-indigo-500", "bg-violet-500", "bg-teal-500", "bg-rose-500"];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

export default function QuestionFeedCard({ question }: { question: ForumQuestionSummary }) {
  const initials = question.author.fullname
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <Link
      href={`/dashboard/forum/${question.question_id}`}
      className="block py-5 transition hover:bg-slate-50/60 last:border-b-0"
      style={{ borderBottom: "2px solid #f0ecfa" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorFor(question.author.id)}`}
          style={{ border: "2px solid var(--neu-ink)" }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm" style={{ color: "var(--neu-text-muted)" }}>
            <span className="font-bold" style={{ color: "var(--neu-ink)" }}>{question.author.fullname}</span> · {timeAgo(question.created_at)}
          </p>
          <h3 className="mt-0.5 text-base font-extrabold" style={{ color: "var(--neu-ink)" }}>{question.title}</h3>
          {question.content ? (
            <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--neu-text-muted)" }}>{question.content}</p>
          ) : null}
          {question.image_url ? (
            <div className="mt-3 overflow-hidden rounded-xl" style={{ border: "2.5px solid var(--neu-ink)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.image_url}
                alt=""
                className="max-h-80 w-full object-cover"
              />
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--neu-text-muted)" }}>
            <MessageCircle size={16} />
            {question.answer_count}
          </div>
        </div>
      </div>
    </Link>
  );
}
