"use client";

import { useMemo, useState } from "react";
import type { CommentSort, ForumAnswer } from "@/lib/forum";
import { countComments, filterCommentTree, sortCommentTree } from "@/lib/forum";
import AnswerComposer from "./AnswerComposer";
import CommentControls from "./CommentControls";
import CommentThread from "./CommentThread";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CommentsSection({
  questionId,
  userInitials,
  currentUserId,
  initialRoots,
}: {
  questionId: string;
  userInitials: string;
  currentUserId: string;
  initialRoots: ForumAnswer[];
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [sort, setSort] = useState<CommentSort>("best");
  const [search, setSearch] = useState("");

  const totalCount = useMemo(() => countComments(initialRoots), [initialRoots]);

  const visible = useMemo(() => {
    const sorted = sortCommentTree(initialRoots, sort);
    return filterCommentTree(sorted, search);
  }, [initialRoots, sort, search]);

  return (
    <div className="space-y-4">
      <AnswerComposer questionId={questionId} userInitials={userInitials} />

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
          userInitials={userInitials}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
