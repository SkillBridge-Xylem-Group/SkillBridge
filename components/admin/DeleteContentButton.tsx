"use client";

import { useState, useTransition } from "react";
import { deleteReportedContentAction } from "@/lib/actions/admin";

type DeleteContentButtonProps = {
  reportId: string;
  reportType: "forum_question" | "forum_answer";
  questionId?: string | null;
  answerId?: string | null;
};

export default function DeleteContentButton({
  reportId,
  reportType,
  questionId,
  answerId,
}: DeleteContentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  function handleClick() {
    setError(null);
    const confirmed = window.confirm(
      `Delete this ${reportType === "forum_question" ? "question" : "answer"}? This can't be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteReportedContentAction({ reportId, reportType, questionId, answerId });
      if (result?.error) setError(result.error);
      else setDeleted(true);
    });
  }

  if (deleted) {
    return <p className="text-xs font-semibold text-slate-400">Deleted</p>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete content"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}