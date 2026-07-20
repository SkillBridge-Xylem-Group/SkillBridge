"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { SessionRequestSummary } from "@/lib/sessionRequests";
import {
  completeSessionAction,
  cancelSessionAction,
  rescheduleSessionAction,
  hideSessionHistoryAction,
} from "@/lib/actions/sessionRequests";
import ReviewModal from "./ReviewModal";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { dateLocaleTag } from "@/lib/i18n/locales";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const STATUS_STYLES: Record<string, { bg: string; ink: string }> = {
  pending: { bg: "#fff6d9", ink: "#b45309" },
  accepted: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  rescheduled: { bg: "#fff6d9", ink: "#b45309" },
  completed: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  declined: { bg: "#fee2e2", ink: "#b91c1c" },
  cancelled: { bg: "#f1f5f9", ink: "#94a3b8" },
};

const HISTORY_STATUSES = new Set(["completed", "cancelled", "declined"]);

function formatDateTime(value: string | null, locale: string, notScheduled: string) {
  if (!value) return notScheduled;
  return new Date(value).toLocaleString(locale, {
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
  const { locale, dictionary } = useLocale();
  const s = dictionary.swaps;
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [confirmHide, setConfirmHide] = useState(false);
  const [hideError, setHideError] = useState("");
  const router = useRouter();

  const canManage = session.status === "accepted" || session.status === "rescheduled";
  const canReview = session.status === "completed" && !session.hasReviewedPartner;
  const canRemoveHistory = HISTORY_STATUSES.has(session.status);

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

  function removeFromHistory() {
    setHideError("");
    startTransition(async () => {
      const result = await hideSessionHistoryAction(session.request_id);
      if (result?.error) {
        setHideError(result.error);
        return;
      }
      setConfirmHide(false);
      router.refresh();
    });
  }

  const status = STATUS_STYLES[session.status] ?? STATUS_STYLES.pending;

  return (
    <tr>
      <td className="py-4">
        <p className="font-bold" style={{ color: "var(--sb-ink)" }}>
          {session.topic?.skill_name ?? s.skillSwapSession}
        </p>
        <p style={{ color: "var(--sb-muted)" }}>{session.topic?.category ?? ""}</p>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 text-xs">
            {session.partner.avatar_url ? <AvatarImage src={session.partner.avatar_url} alt="" /> : null}
            <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
              {getInitials(session.partner.fullname)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold" style={{ color: "var(--sb-ink)" }}>
            {session.partner.fullname}
          </span>
        </div>
      </td>
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
              {dictionary.common.save}
            </button>
            <button
              type="button"
              onClick={() => setIsRescheduling(false)}
              className="nb-btn bg-white px-3 py-1 text-xs"
              style={{ color: "var(--sb-ink)" }}
            >
              {s.cancel}
            </button>
          </div>
        ) : (
          formatDateTime(session.scheduled_time, dateLocaleTag(locale), s.notScheduled)
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
        <div className="flex flex-col items-start gap-1.5">
          {canManage && !isRescheduling && (
            <div className="flex w-[11.5rem] flex-col gap-1.5">
              <Link
                href={`/dashboard/swap-session/${session.request_id}`}
                className="nb-btn px-3 py-1.5 text-xs text-white"
                style={{ background: "var(--sb-gradient)" }}
              >
                {s.joinSession}
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={markComplete}
                className="nb-btn bg-white px-3 py-1.5 text-xs disabled:opacity-50"
                style={{ color: "var(--sb-ink)" }}
              >
                {s.markComplete}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsRescheduling(true)}
                className="nb-btn bg-white px-3 py-1.5 text-xs disabled:opacity-50"
                style={{ color: "var(--sb-ink)" }}
              >
                {s.reschedule}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={cancel}
                className="nb-btn bg-white px-3 py-1.5 text-xs text-red-600 disabled:opacity-50"
              >
                {s.cancel}
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
              {s.leaveReview}
            </button>
          )}
          {session.status === "completed" && session.hasReviewedPartner && (
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "#f1f5f9", color: "var(--sb-muted)" }}
            >
              {s.reviewed}
            </span>
          )}
          {canRemoveHistory ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setHideError("");
                setConfirmHide(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={13} />
              {s.removeFromHistory}
            </button>
          ) : null}
          {hideError ? <p className="max-w-[11.5rem] text-[11px] font-medium text-red-600">{hideError}</p> : null}
        </div>

        <ConfirmDialog
          open={confirmHide}
          title={s.removeFromHistory}
          description={s.removeFromHistoryConfirm}
          confirmLabel={s.removeFromHistory}
          cancelLabel={dictionary.common.cancel}
          danger
          busy={isPending}
          onCancel={() => setConfirmHide(false)}
          onConfirm={removeFromHistory}
        />
      </td>
    </tr>
  );
}

export default function SessionsTable({ sessions }: { sessions: SessionRequestSummary[] }) {
  const { dictionary } = useLocale();
  const s = dictionary.swaps;
  const [reviewTarget, setReviewTarget] = useState<SessionRequestSummary | null>(null);
  const router = useRouter();

  return (
    <div className="nb-card p-6 sm:p-8">
      <h2 className="text-lg font-extrabold nb-heading">{s.recentSessions}</h2>

      {sessions.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--sb-muted)" }}>
          {s.noSessionsHint}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--sb-muted)" }}>
                <th className="pb-3 font-bold">{s.sessionInfo}</th>
                <th className="pb-3 font-bold">{s.swapPartner}</th>
                <th className="pb-3 font-bold">{s.dateTime}</th>
                <th className="pb-3 font-bold">{s.status}</th>
                <th className="pb-3 font-bold">{s.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#eef7f0" }}>
              {sessions.map((row) => (
                <SessionRow key={row.request_id} session={row} onReview={setReviewTarget} />
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
