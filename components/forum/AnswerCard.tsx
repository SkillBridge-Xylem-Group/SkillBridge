"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp, Crown } from "lucide-react";
import { toggleVoteAction } from "@/lib/actions/forum";
import type { ForumAnswer } from "@/lib/forum";

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
    <div className={`rounded-xl border p-4 ${answer.isTopAnswer ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-white"}`}>
      {answer.isTopAnswer && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
          <Crown size={14} />
          Top Answer
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-bold text-slate-900">{answer.author.fullname}</span>
            <span className="text-slate-400">· {timeAgo(answer.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">{answer.content}</p>
        </div>
        <button
          type="button"
          onClick={vote}
          disabled={isPending}
          className={`flex flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold disabled:opacity-50 ${
            answer.hasVoted ? "border-brand bg-brand-light text-brand" : "border-slate-200 text-slate-500 hover:border-brand/40"
          }`}
        >
          <ArrowBigUp size={16} fill={answer.hasVoted ? "currentColor" : "none"} />
          {answer.vote_count}
        </button>
      </div>
    </div>
  );
}