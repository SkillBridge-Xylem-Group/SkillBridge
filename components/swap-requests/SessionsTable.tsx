"use client";

import { useState, useTransition, type ReactNode } from "react";
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
import { datetimeLocalMinValue, isFutureScheduledTime, SCHEDULE_PAST_ERROR } from "@/lib/sessionSchedule";

const STATUS_STYLES: Record<string, { bg: string; ink: string }> = {
  pending: { bg: "#fff6d9", ink: "#b45309" },
  accepted: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  rescheduled: { bg: "#fff6d9", ink: "#b45309" },
  completed: { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  declined: { bg: "#fee2e2", ink: "#b91c1c" },
  cancelled: { bg: "#f1f5f9", ink: "#94a3b8" },
};

const HISTORY_STATUSES = new Set(["completed", "cancelled", "declined"]);

const TH_CLASS =
  "px-4 pb-3 pt-1 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:pl-0 last:pr-0";
const TD_CLASS = "px-4 py-4 align-middle first:pl-0 last:pr-0";

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

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? { background: "var(--sb-gradient)", color: "#fff" }
      : variant === "danger"
        ? { background: "#fff", color: "#dc2626", border: "1px solid #fecaca" }
        : { background: "#fff", color: "var(--sb-ink)", border: "1px solid #e2e8f0" };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={styles}
    >
      {children}
    </button>
  );
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
  const statusLabels: Record<string, string> = {
    pending: s.statusPending,
    accepted: s.statusAccepted,
    rescheduled: s.statusRescheduled,
    completed: s.statusCompleted,
    declined: s.statusDeclined,
    cancelled: s.statusCancelled,
  };
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [confirmHide, setConfirmHide] = useState(false);
  const [hideError, setHideError] = useState("");
  const router = useRouter();
  const minScheduleTime = datetimeLocalMinValue();

  const canManage = session.status === "accepted" || session.status === "rescheduled";
  const canReview = session.status === "completed" && !session.hasReviewedPartner;
  const canRemoveHistory = HISTORY_STATUSES.has(session.status);
  const category = session.topic?.category?.trim();

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
    if (!isFutureScheduledTime(newTime)) {
      setScheduleError(s.scheduleMustBeFuture);
      return;
    }
    setScheduleError("");
    startTransition(async () => {
      const result = await rescheduleSessionAction(session.request_id, new Date(newTime).toISOString());
      if (result?.error === SCHEDULE_PAST_ERROR) {
        setScheduleError(s.scheduleMustBeFuture);
        return;
      }
      if (result?.error) {
        setScheduleError(result.error);
        return;
      }
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
    <tr className="transition hover:bg-[#f8fcfa]">
      <td className={TD_CLASS}>
        <div className="min-w-[10rem]">
          <p className="font-semibold leading-snug" style={{ color: "var(--sb-ink)" }}>
            {session.topic?.skill_name ?? s.skillSwapSession}
          </p>
          {category ? (
            <p className="mt-0.5 text-xs" style={{ color: "var(--sb-muted)" }}>
              {category}
            </p>
          ) : null}
        </div>
      </td>
      <td className={TD_CLASS}>
        <div className="flex min-w-[9rem] items-center gap-2.5">
          <Avatar className="h-9 w-9 shrink-0 text-xs">
            {session.partner.avatar_url ? <AvatarImage src={session.partner.avatar_url} alt="" /> : null}
            <AvatarFallback className="font-bold text-white" style={{ background: "var(--sb-gradient)" }}>
              {getInitials(session.partner.fullname)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium leading-snug" style={{ color: "var(--sb-ink)" }}>
            {session.partner.fullname}
          </span>
        </div>
      </td>
      <td className={`${TD_CLASS} whitespace-nowrap text-sm tabular-nums`} style={{ color: "var(--sb-muted)" }}>
        {isRescheduling ? (
          <div className="flex max-w-xs flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={newTime}
              min={minScheduleTime}
              onChange={(e) => {
                setNewTime(e.target.value);
                setScheduleError("");
              }}
              className="nb-input px-2 py-1.5 text-xs"
            />
            <ActionButton
              variant="primary"
              disabled={isPending || !newTime || !isFutureScheduledTime(newTime)}
              onClick={confirmReschedule}
            >
              {dictionary.common.save}
            </ActionButton>
            <ActionButton
              disabled={isPending}
              onClick={() => {
                setIsRescheduling(false);
                setNewTime("");
                setScheduleError("");
              }}
            >
              {s.cancel}
            </ActionButton>
            </div>
            {scheduleError ? <p className="text-xs font-medium text-red-600">{scheduleError}</p> : null}
          </div>
        ) : (
          formatDateTime(session.scheduled_time, dateLocaleTag(locale), s.notScheduled)
        )}
      </td>
      <td className={TD_CLASS}>
        <span
          className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: status.bg, color: status.ink }}
        >
          {statusLabels[session.status] ?? session.status}
        </span>
      </td>
      <td className={TD_CLASS}>
        <div className="flex min-w-[11rem] flex-wrap items-center gap-2">
          {canManage && !isRescheduling ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/swap-session/${session.request_id}`}
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: "var(--sb-gradient)" }}
              >
                {s.joinSession}
              </Link>
              <ActionButton disabled={isPending} onClick={markComplete}>
                {s.markComplete}
              </ActionButton>
              <ActionButton
                disabled={isPending}
                onClick={() => {
                  setScheduleError("");
                  setIsRescheduling(true);
                }}
              >
                {s.reschedule}
              </ActionButton>
              <ActionButton variant="danger" disabled={isPending} onClick={cancel}>
                {s.cancel}
              </ActionButton>
            </div>
          ) : null}

          {canReview ? (
            <ActionButton variant="primary" onClick={() => onReview(session)}>
              {s.leaveReview}
            </ActionButton>
          ) : null}

          {session.status === "completed" && session.hasReviewedPartner ? (
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "#f1f5f9", color: "var(--sb-muted)" }}
            >
              {s.reviewed}
            </span>
          ) : null}

          {canRemoveHistory ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setHideError("");
                setConfirmHide(true);
              }}
              aria-label={s.removeFromHistory}
              title={s.removeFromHistory}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          ) : null}

          {!canManage && !canReview && !canRemoveHistory && session.status !== "completed" ? (
            <span className="text-sm text-slate-300">—</span>
          ) : null}
        </div>
        {hideError ? <p className="mt-1.5 max-w-[14rem] text-[11px] font-medium text-red-600">{hideError}</p> : null}

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
    <div className="nb-card overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <h2 className="text-lg font-extrabold nb-heading">{s.recentSessions}</h2>
      </div>

      {sessions.length === 0 ? (
        <p className="px-6 py-8 text-sm sm:px-8" style={{ color: "var(--sb-muted)" }}>
          {s.noSessionsHint}
        </p>
      ) : (
        <div className="overflow-x-auto px-6 pb-2 sm:px-8">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className={TH_CLASS}>{s.sessionInfo}</th>
                <th className={TH_CLASS}>{s.swapPartner}</th>
                <th className={TH_CLASS}>{s.dateTime}</th>
                <th className={TH_CLASS}>{s.status}</th>
                <th className={`${TH_CLASS} min-w-[11rem]`}>{s.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((row) => (
                <SessionRow key={row.request_id} session={row} onReview={setReviewTarget} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewTarget ? (
        <ReviewModal
          open
          sessionRequestId={reviewTarget.request_id}
          partner={reviewTarget.partner}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
