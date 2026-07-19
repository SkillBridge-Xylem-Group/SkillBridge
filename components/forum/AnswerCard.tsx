"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp, Crown } from "lucide-react";
import { toggleVoteAction } from "@/lib/actions/forum";
import type { ForumAnswer } from "@/lib/forum";
import FormattedContent from "./FormattedContent";
import ForumAuthorAvatar from "./ForumAuthorAvatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";

export default function AnswerCard({ answer, questionId }: { answer: ForumAnswer; questionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { locale, dictionary } = useLocale();

  function vote() {
    startTransition(async () => {
      await toggleVoteAction(answer.answer_id, questionId);
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: answer.isTopAnswer ? "#fffbea" : "#fff",
        boxShadow: "var(--sb-shadow-sm)",
      }}
    >
      {answer.isTopAnswer && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--sb-tint-amber-ink)" }}>
          <Crown size={14} />
          Top Answer
        </div>
      )}
      <div className="flex items-start gap-3">
        <ForumAuthorAvatar
          name={answer.author.fullname}
          avatarUrl={answer.author.avatar_url}
          className="h-9 w-9"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-bold" style={{ color: "var(--sb-ink)" }}>{answer.author.fullname}</span>
            <span style={{ color: "var(--sb-muted)" }}>
              · {formatRelativeTimeLabel(answer.created_at, dictionary.common, locale)}
            </span>
          </div>
          {answer.content ? (
            <FormattedContent text={answer.content} className="mt-1 space-y-1 text-sm" />
          ) : null}
          {answer.image_url ? (
            <div className="mt-3 overflow-hidden rounded-lg">
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
          style={
            answer.hasVoted
              ? { background: "var(--sb-gradient)", color: "#fff" }
              : { background: "#f3f4f6", color: "var(--sb-muted)" }
          }
        >
          <ArrowBigUp size={16} fill={answer.hasVoted ? "currentColor" : "none"} />
          {answer.vote_count}
        </button>
      </div>
    </div>
  );
}