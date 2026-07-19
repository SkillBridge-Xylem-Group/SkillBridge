"use client";

import { useState } from "react";
import { MessageSquare, Share2 } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

export default function PostActionBar({
  questionId,
  commentCount,
}: {
  questionId: string;
  commentCount: number;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/dashboard/forum/${questionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
      >
        <MessageSquare size={14} />
        {interpolate(f.commentsCount, { n: commentCount })}
      </span>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
      >
        <Share2 size={14} />
        {copied ? f.linkCopied : f.shareAction}
      </button>
    </div>
  );
}
