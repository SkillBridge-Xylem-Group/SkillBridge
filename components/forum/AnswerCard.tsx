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
  userInitials = "?",
}: {
  answer: ForumAnswer;
  questionId: string;
  userInitials?: string;
}) {
  return <CommentThread roots={[answer]} questionId={questionId} userInitials={userInitials} />;
}
