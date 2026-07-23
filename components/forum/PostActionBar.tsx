"use client";



import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Flag, MessageSquare, Share2, Trash2 } from "lucide-react";

import { createQuestionReportAction, deleteQuestionAction } from "@/lib/actions/forum";

import type { ReportReasonKey } from "@/lib/forumReportReasons";

import ReportContentDialog from "./ReportContentDialog";
import ConfirmDialog from "./ConfirmDialog";

import { useLocale } from "@/components/i18n/LocaleProvider";

import { interpolate } from "@/lib/i18n/interpolate";



export default function PostActionBar({

  questionId,

  commentCount,

  authorId,

  currentUserId,

}: {

  questionId: string;

  commentCount: number;

  authorId: string;

  currentUserId: string;

}) {

  const router = useRouter();

  const { dictionary } = useLocale();

  const f = dictionary.forum;

  const [copied, setCopied] = useState(false);

  const [toast, setToast] = useState("");

  const [reportOpen, setReportOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const isOwnPost = authorId === currentUserId;



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



  function submitReport(payload: { reasonKey: ReportReasonKey; details: string }) {

    startTransition(async () => {

      const result = await createQuestionReportAction({

        questionId,

        reasonKey: payload.reasonKey,

        details: payload.details,

      });

      if (result?.error) {

        setToast(result.error === "You already reported this content." ? f.reportAlready : f.reportFailed);

      } else {

        setReportOpen(false);

        setToast(f.reportThanks);

      }

      window.setTimeout(() => setToast(""), 2500);

    });

  }

  function deletePost() {
    setConfirmOpen(true);
  }

  function confirmDeletePost() {
    startTransition(async () => {
      const result = await deleteQuestionAction(questionId);
      if (result?.error) {
        setConfirmOpen(false);
        setToast(result.error);
        window.setTimeout(() => setToast(""), 2500);
        return;
      }
      setConfirmOpen(false);
      router.push(
        result?.subforumSlug ? `/dashboard/forum/c/${result.subforumSlug}` : "/dashboard/forum"
      );
      router.refresh();
    });
  }

  return (

    <>

      <div className="mt-4 space-y-2">

        <div className="flex flex-wrap items-center gap-2">

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">

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

          {!isOwnPost ? (

            <button

              type="button"

              onClick={() => setReportOpen(true)}

              disabled={isPending}

              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"

            >

              <Flag size={14} />

              {f.reportAction}

            </button>

          ) : (

            <button

              type="button"

              onClick={deletePost}

              disabled={isPending}

              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"

            >

              <Trash2 size={14} />

              Delete

            </button>

          )}

        </div>

        {toast ? (

          <p className="text-xs font-semibold" style={{ color: "var(--sb-teal-dark)" }} role="status">

            {toast}

          </p>

        ) : null}

      </div>



      <ReportContentDialog

        open={reportOpen}

        busy={isPending}

        onClose={() => setReportOpen(false)}

        onSubmit={submitReport}

      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this post?"
        description="This can't be undone. Your post and all its comments will be removed."
        confirmLabel="Delete post"
        busy={isPending}
        onConfirm={confirmDeletePost}
        onClose={() => setConfirmOpen(false)}
      />

    </>

  );

}