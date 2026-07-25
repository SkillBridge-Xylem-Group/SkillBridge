"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CommentSort, ForumAnswer } from "@/lib/forum";
import { countComments, filterCommentTree, sortCommentTree } from "@/lib/forum";
import AnswerComposer from "./AnswerComposer";
import CommentControls from "./CommentControls";
import CommentThread from "./CommentThread";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CommentsSection({
  questionId,
  communitySlug,
  communityTitle,
  canParticipate,
  userName,
  userAvatarUrl = null,
  currentUserId,
  initialRoots,
}: {
  questionId: string;
  communitySlug: string;
  communityTitle: string;
  canParticipate: boolean;
  userName: string;
  userAvatarUrl?: string | null;
  currentUserId: string;
  initialRoots: ForumAnswer[];
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const c = dictionary.common;
  const [sort, setSort] = useState<CommentSort>("best");
  const [search, setSearch] = useState("");

  const totalCount = useMemo(() => countComments(initialRoots), [initialRoots]);

  const visible = useMemo(() => {
    const sorted = sortCommentTree(initialRoots, sort);
    return filterCommentTree(sorted, search);
  }, [initialRoots, sort, search]);

  return (
    <div className="space-y-4">
      {canParticipate ? (
        <AnswerComposer questionId={questionId} userName={userName} userAvatarUrl={userAvatarUrl} />
      ) : (
        <div className="nb-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900">{f.joinToComment}</p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--sb-muted)" }}>
              {f.joinToCommentHint}
            </p>
          </div>
          <Link
            href={`/dashboard/forum/c/${communitySlug}`}
            className="inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "var(--sb-gradient)" }}
          >
            {c.join} {communityTitle}
          </Link>
        </div>
      )}

      {totalCount > 0 ? (
        <CommentControls
          sort={sort}
          onSortChange={setSort}
          search={search}
          onSearchChange={setSearch}
        />
      ) : null}

      {search.trim() && visible.length === 0 ? (
        <p className="py-6 text-center text-sm" style={{ color: "var(--sb-muted)" }}>
          {f.noCommentsMatch}
        </p>
      ) : (
        <CommentThread
          key={sort}
          roots={visible}
          questionId={questionId}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          currentUserId={currentUserId}
          canParticipate={canParticipate}
        />
      )}
    </div>
  );
}
