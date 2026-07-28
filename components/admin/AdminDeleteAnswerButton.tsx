"use client";

import { useState, useTransition } from "react";
import { deleteForumAnswerAction } from "@/lib/actions/admin-content";

export default function AdminDeleteAnswerButton({ answerId }: { answerId: string }) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  function handleClick() {
    if (!window.confirm("Delete this answer? This can't be undone.")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteForumAnswerAction(answerId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDeleted(true);
    });
  }

  if (deleted) {
    return <span className="text-xs font-semibold text-slate-400">Deleted</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}