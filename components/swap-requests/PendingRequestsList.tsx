"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { respondToRequestAction } from "@/lib/actions/sessionRequests";
import type { SessionRequestSummary } from "@/lib/sessionRequests";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import {
  datetimeLocalMaxValue,
  datetimeLocalMinValue,
  isAllowedScheduledTime,
  isScheduledTimeTooFar,
  SCHEDULE_PAST_ERROR,
  SCHEDULE_TOO_FAR_ERROR,
} from "@/lib/sessionSchedule";

export default function PendingRequestsList({ requests }: { requests: SessionRequestSummary[] }) {
  const { dictionary } = useLocale();
  const s = dictionary.swaps;
  const [isPending, startTransition] = useTransition();
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [nowTick, setNowTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!schedulingId) return;
    const id = window.setInterval(() => setNowTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(id);
  }, [schedulingId]);

  const minScheduleTime = useMemo(() => datetimeLocalMinValue(), [nowTick, schedulingId]);
  const maxScheduleTime = useMemo(() => datetimeLocalMaxValue(), [nowTick, schedulingId]);

  function decline(requestId: string) {
    startTransition(async () => {
      await respondToRequestAction(requestId, "declined");
      router.refresh();
    });
  }

  function confirmAccept(requestId: string) {
    if (!scheduledTime) return;
    if (!isAllowedScheduledTime(scheduledTime, new Date())) {
      setScheduleError(
        isScheduledTimeTooFar(scheduledTime, new Date()) ? s.scheduleTooFar : s.scheduleMustBeFuture
      );
      return;
    }
    setScheduleError("");
    startTransition(async () => {
      const result = await respondToRequestAction(
        requestId,
        "accepted",
        new Date(scheduledTime).toISOString()
      );
      if (result?.error === SCHEDULE_PAST_ERROR) {
        setScheduleError(s.scheduleMustBeFuture);
        return;
      }
      if (result?.error === SCHEDULE_TOO_FAR_ERROR) {
        setScheduleError(s.scheduleTooFar);
        return;
      }
      if (result?.error) {
        setScheduleError(result.error);
        return;
      }
      setSchedulingId(null);
      setScheduledTime("");
      router.refresh();
    });
  }

  return (
    <div className="nb-card p-6">
      <h2 className="text-base font-extrabold nb-heading">{s.pendingRequests}</h2>

      {requests.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--sb-muted)" }}>{s.noPending}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {requests.map((r) => {
            const initials = r.partner.fullname
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p.charAt(0).toUpperCase())
              .join("");
            const isScheduling = schedulingId === r.request_id;

            return (
              <div key={r.request_id} className="rounded-2xl p-3" style={{ background: "#fbfffc", boxShadow: "var(--sb-shadow-sm)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-extrabold text-white"
                      style={{ background: "var(--sb-gradient)" }}
                    >
                      {r.partner.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.partner.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{r.partner.fullname}</p>
                      <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
                        {r.topic
                          ? interpolate(s.wantsToSwap, { skill: r.topic.skill_name })
                          : s.sentRequest}
                      </p>
                    </div>
                  </div>
                  {!isScheduling && (
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={s.accept}
                        disabled={isPending}
                        onClick={() => setSchedulingId(r.request_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                        style={{ background: "var(--sb-gradient)" }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        aria-label={s.decline}
                        disabled={isPending}
                        onClick={() => decline(r.request_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 disabled:opacity-50"
                        style={{ background: "#fff", boxShadow: "var(--sb-shadow-sm)" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isScheduling && (
                  <div className="mt-3 flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid #eef7f0" }}>
                    <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      min={minScheduleTime}
                      max={maxScheduleTime}
                      onChange={(e) => {
                        setScheduledTime(e.target.value);
                        setScheduleError("");
                      }}
                      className="nb-input px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      disabled={
                        isPending ||
                        !scheduledTime ||
                        !isAllowedScheduledTime(scheduledTime, new Date())
                      }
                      onClick={() => confirmAccept(r.request_id)}
                      className="nb-btn px-4 py-1.5 text-xs text-white disabled:opacity-50"
                      style={{ background: "var(--sb-gradient)" }}
                    >
                      {s.confirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchedulingId(null);
                        setScheduledTime("");
                        setScheduleError("");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold"
                      style={{ color: "var(--sb-muted)" }}
                    >
                      {s.cancel}
                    </button>
                    </div>
                    {scheduleError ? (
                      <p className="text-xs font-medium text-red-600">{scheduleError}</p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
