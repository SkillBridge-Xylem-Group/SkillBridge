"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionRequestSummary } from "@/lib/sessionRequests";
import { completeSessionAction, cancelSessionAction, rescheduleSessionAction } from "@/lib/actions/sessionRequests";
import ReviewModal from "./ReviewModal";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  accepted: "bg-emerald-100 text-emerald-700",
  rescheduled: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-400",
};

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled yet";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionRow({
  session,
  onReview,
}: {
  session: SessionRequestSummary;
  onReview: (session: SessionRequestSummary) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTime, setNewTime] = useState("");
  const router = useRouter();

  const canManage = session.status === "accepted" || session.status === "rescheduled";
  const canReview = session.status === "completed" && !session.hasReviewedPartner;

  function markComplete() {
    startTransition(async () => {
      await completeSessionAction(session.request_id);
      router.refresh();
      onReview(session);
    });
  }

  function cancel() {
    startTransition(async () => {
      await cancelSessionAction(session.request_id);
      router.refresh();
    });
  }

  function confirmReschedule() {
    if (!newTime) return;
    startTransition(async () => {
      await rescheduleSessionAction(session.request_id, new Date(newTime).toISOString());
      setIsRescheduling(false);
      setNewTime("");
      router.refresh();
    });
  }

  return (
    <tr>
      <td className="py-4">
        <p className="font-bold text-slate-900">{session.topic?.skill_name ?? "Skill swap session"}</p>
        <p className="text-slate-500">{session.topic?.category ?? ""}</p>
      </td>
      <td className="py-4 text-slate-700">{session.partner.fullname}</td>
      <td className="py-4 text-slate-600">
        {isRescheduling ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              disabled={isPending || !newTime}
              onClick={confirmReschedule}
              className="btn-pill bg-brand px-3 py-1 text-xs text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          formatDateTime(session.scheduled_time)
        )}
      </td>
      <td className="py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[session.status] ?? "bg-slate-100 text-slate-600"}`}
        >
          {session.status}
        </span>
      </td>
      <td className="py-4">
        {canManage && !isRescheduling && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/swap-session/${session.request_id}`}
              className="text-xs font-bold text-brand hover:underline"
            >
              Join Session
            </Link>
            <button
              type="button"
              disabled={isPending}
              onClick={markComplete}
              className="text-xs font-bold text-slate-700 hover:underline disabled:opacity-50"
            >
              Mark Complete
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsRescheduling(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={cancel}
              className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
        {canReview && (
          <button
            type="button"
            onClick={() => onReview(session)}
            className="text-xs font-bold text-amber-600 hover:underline"
          >
            Leave Review
          </button>
        )}
        {session.status === "completed" && session.hasReviewedPartner && (
          <span className="text-xs font-semibold text-slate-400">Reviewed</span>
        )}
      </td>
    </tr>
  );
}

export default function SessionsTable({ sessions }: { sessions: SessionRequestSummary[] }) {
  const [reviewTarget, setReviewTarget] = useState<SessionRequestSummary | null>(null);
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-extrabold text-slate-900">Recent &amp; Upcoming Sessions</h2>

      {sessions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No sessions yet. Send a swap request from someone&apos;s profile to get started.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest text-slate-400">
                <th className="pb-3 font-bold">Session Info</th>
                <th className="pb-3 font-bold">Swap Partner</th>
                <th className="pb-3 font-bold">Date &amp; Time</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <SessionRow key={s.request_id} session={s} onReview={setReviewTarget} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          open
          sessionRequestId={reviewTarget.request_id}
          partner={reviewTarget.partner}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => router.refresh()}
        />
      )}
    </div>
  );
}
