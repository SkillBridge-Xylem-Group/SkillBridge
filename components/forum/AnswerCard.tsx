"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp, Crown } from "lucide-react";
import { toggleVoteAction } from "@/lib/actions/forum";
import type { ForumAnswer } from "@/lib/forum";
import FormattedContent from "./FormattedContent";

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnswerCard({ answer, questionId }: { answer: ForumAnswer; questionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function vote() {
    startTransition(async () => {
      await toggleVoteAction(answer.answer_id, questionId);
      router.refresh();
    });
  }

  const initials = answer.author.fullname
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: "2.5px solid var(--neu-ink)",
        background: answer.isTopAnswer ? "#fffbea" : "#fff",
        boxShadow: answer.isTopAnswer ? "4px 4px 0 var(--neu-yellow)" : "none",
      }}
    >
      {answer.isTopAnswer && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--neu-orange)" }}>
          <Crown size={14} />
          Top Answer
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "var(--neu-indigo)", border: "2px solid var(--neu-ink)" }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-bold" style={{ color: "var(--neu-ink)" }}>{answer.author.fullname}</span>
            <span style={{ color: "var(--neu-text-muted)" }}>· {timeAgo(answer.created_at)}</span>
          </div>
          {answer.content ? (
            <FormattedContent text={answer.content} className="mt-1 space-y-1 text-sm" />
          ) : null}
          {answer.image_url ? (
            <div className="mt-3 overflow-hidden rounded-lg" style={{ border: "2px solid var(--neu-ink)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={answer.image_url} alt="" className="max-h-80 w-full object-contain" />
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={vote}
          disabled={isPending}
          className="flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-50"
          style={{
            border: "2px solid var(--neu-ink)",
            background: answer.hasVoted ? "var(--neu-indigo)" : "#fff",
            color: answer.hasVoted ? "#fff" : "var(--neu-text-muted)",
          }}
        >
          <ArrowBigUp size={16} fill={answer.hasVoted ? "currentColor" : "none"} />
          {answer.vote_count}
        </button>
      </div>
    </div>
  );
}