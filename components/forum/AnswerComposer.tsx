"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnswerAction } from "@/lib/actions/forum";

export default function AnswerComposer({ questionId }: { questionId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const result = await createAnswerAction(questionId, content);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setContent("");
      setError("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        className="w-full resize-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !content.trim()}
          className="btn-pill bg-brand px-4 py-1.5 text-xs text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Replying..." : "Reply"}
        </button>
      </div>
    </div>
  );
}