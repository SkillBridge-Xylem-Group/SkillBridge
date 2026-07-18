"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionRequestSummary } from "@/lib/sessionRequests";
import { completeSessionAction, cancelSessionAction, rescheduleSessionAction } from "@/lib/actions/sessionRequests";
import ReviewModal from "./ReviewModal";

const STATUS_STYLES: Record<string, { bg: string; ink: string }> = {
  pending: { bg: "#fff6d9", ink: "#b45309" },
  accepted: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  rescheduled: { bg: "#fff6d9", ink: "#b45309" },
  completed: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  declined: { bg: "#fee2e2", ink: "#b91c1c" },
  cancelled: { bg: "#f1f5f9", ink: "#94a3b8" },
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

  const status = STATUS_STYLES[session.status] ?? STATUS_STYLES.pending;

  return (
    <tr>
      <td className="py-4">
        <p className="font-bold" style={{ color: "var(--sb-ink)" }}>{session.topic?.skill_name ?? "Skill swap session"}</p>
        <p style={{ color: "var(--sb-muted)" }}>{session.topic?.category ?? ""}</p>
      </td>
      <td className="py-4" style={{ color: "var(--sb-ink)" }}>{session.partner.fullname}</td>
      <td className="py-4" style={{ color: "var(--sb-muted)" }}>
        {isRescheduling ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="nb-input px-2 py-1 text-xs"
            />
            <button
              type="button"
              disabled={isPending || !newTime}
              onClick={confirmReschedule}
              className="nb-btn px-3 py-1 text-xs text-white disabled:opacity-50"
              style={{ background: "var(--sb-gradient)" }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="nb-btn bg-white px-3 py-1 text-xs"
              style={{ color: "var(--sb-ink)" }}
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
          className="rounded-full px-3 py-1 text-xs font-bold capitalize"
          style={{ background: status.bg, color: status.ink }}
        >
          {session.status}
        </span>
      </td>
      <td className="py-4">
        {canManage && !isRescheduling && (
          <div className="flex w-[11.5rem] flex-col gap-1.5">
            <Link
              href={`/dashboard/swap-session/${session.request_id}`}
              className="nb-btn px-3 py-1.5 text-xs text-white"
              style={{ background: "var(--sb-gradient)" }}
            >
              Join Session
            </Link>
            <button
              type="button"
              disabled={isPending}
              onClick={markComplete}
              className="nb-btn bg-white px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ color: "var(--sb-ink)" }}
            >
              Mark Complete
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsRescheduling(true)}
              className="nb-btn bg-white px-3 py-1.5 text-xs disabled:opacity-50"
              style={{ color: "var(--sb-ink)" }}
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={cancel}
              className="nb-btn bg-white px-3 py-1.5 text-xs text-red-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
        {canReview && (
          <button
            type="button"
            onClick={() => onReview(session)}
            className="nb-btn px-3 py-1.5 text-xs text-white"
            style={{ background: "var(--sb-gradient)" }}
          >
            Leave Review
          </button>
        )}
        {session.status === "completed" && session.hasReviewedPartner && (
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "#f1f5f9", color: "var(--sb-muted)" }}
          >
            Reviewed
          </span>
        )}
      </td>
    </tr>
  );
}

export default function SessionsTable({ sessions }: { sessions: SessionRequestSummary[] }) {
  const [reviewTarget, setReviewTarget] = useState<SessionRequestSummary | null>(null);
  const router = useRouter();

  return (
    <div className="nb-card p-6 sm:p-8">
      <h2 className="text-lg font-extrabold nb-heading">Recent &amp; Upcoming Sessions</h2>

      {sessions.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--sb-muted)" }}>
          No sessions yet. Send a swap request from someone&apos;s profile to get started.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--sb-muted)" }}>
                <th className="pb-3 font-bold">Session Info</th>
                <th className="pb-3 font-bold">Swap Partner</th>
                <th className="pb-3 font-bold">Date &amp; Time</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#eef7f0" }}>
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
