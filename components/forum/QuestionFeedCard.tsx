"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { ForumQuestionSummary } from "@/lib/forum";
import { getForumSubforum } from "@/lib/forumSubforums";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";
import ForumAuthorAvatar from "./ForumAuthorAvatar";

export default function QuestionFeedCard({
  question,
  showSubforum = true,
}: {
  question: ForumQuestionSummary;
  showSubforum?: boolean;
}) {
  const { locale, dictionary } = useLocale();
  const subforum = getForumSubforum(question.subforum_slug);

  return (
    <Link
      href={`/dashboard/forum/${question.question_id}`}
      className="block py-5 transition hover:bg-[#f6fffb] last:border-b-0"
      style={{ borderBottom: "1px solid #eef7f0" }}
    >
      <div className="flex items-start gap-3">
        <ForumAuthorAvatar name={question.author.fullname} avatarUrl={question.author.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
            {showSubforum ? (
              <>
                <span className="font-semibold" style={{ color: "var(--sb-teal-dark)" }}>{subforum.title}</span>
                <span> · </span>
              </>
            ) : null}
            <span className="font-bold" style={{ color: "var(--sb-ink)" }}>{question.author.fullname}</span>
            {" · "}
            {formatRelativeTimeLabel(question.created_at, dictionary.common, locale)}
          </p>
          <h3 className="mt-0.5 text-base font-extrabold" style={{ color: "var(--sb-ink)" }}>{question.title}</h3>
          {question.content ? (
            <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--sb-muted)" }}>{question.content}</p>
          ) : null}
          {question.image_url ? (
            <div className="mt-3 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.image_url} alt="" className="max-h-80 w-full object-cover" />
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
            <MessageCircle size={16} />
            {question.answer_count}
          </div>
        </div>
      </div>
    </Link>
  );
}
