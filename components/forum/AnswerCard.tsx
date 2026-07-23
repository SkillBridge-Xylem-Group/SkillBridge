"use client";

/**
 * @deprecated Prefer CommentThread via CommentsSection.
 * Kept so any leftover imports still compile against the new ForumAnswer shape.
 */
import type { ForumAnswer } from "@/lib/forum";
import CommentThread from "./CommentThread";

export default function AnswerCard({
  answer,
  questionId,
  userName = "there",
  userAvatarUrl = null,
  currentUserId = "",
}: {
  answer: ForumAnswer;
  questionId: string;
  userName?: string;
  userAvatarUrl?: string | null;
  currentUserId?: string;
}) {
  return (
    <CommentThread
      roots={[answer]}
      questionId={questionId}
      userName={userName}
      userAvatarUrl={userAvatarUrl}
      currentUserId={currentUserId}
    />
  );
}
