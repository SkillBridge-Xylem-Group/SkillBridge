"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createQuestionAction } from "@/lib/actions/forum";

export default function QuestionComposer({ userInitials }: { userInitials: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const result = await createQuestionAction(title, content);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setTitle("");
      setContent("");
      setError("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">What&apos;s your question?</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a short, clear title..."
            maxLength={150}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share details so the community can help..."
            rows={2}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand focus:outline-none"
          />
          {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !title.trim() || !content.trim()}
          className="btn-pill flex items-center gap-2 bg-brand px-5 py-2 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post"}
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}