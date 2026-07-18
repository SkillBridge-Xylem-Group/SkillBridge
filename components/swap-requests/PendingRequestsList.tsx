"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { respondToRequestAction } from "@/lib/actions/sessionRequests";
import type { SessionRequestSummary } from "@/lib/sessionRequests";

export default function PendingRequestsList({ requests }: { requests: SessionRequestSummary[] }) {
  const [isPending, startTransition] = useTransition();
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const router = useRouter();

  function decline(requestId: string) {
    startTransition(async () => {
      await respondToRequestAction(requestId, "declined");
      router.refresh();
    });
  }

  function confirmAccept(requestId: string) {
    if (!scheduledTime) return;
    startTransition(async () => {
      await respondToRequestAction(
        requestId,
        "accepted",
        new Date(scheduledTime).toISOString()
      );
      setSchedulingId(null);
      setScheduledTime("");
      // Stay on swap-requests; user joins via Join Session when ready.
      router.refresh();
    });
  }

  return (
    <div className="nb-card p-6">
      <h2 className="text-base font-extrabold nb-heading">Pending Requests</h2>

      {requests.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--sb-muted)" }}>No pending requests right now.</p>
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
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: "var(--sb-gradient)" }}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{r.partner.fullname}</p>
                      <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
                        {r.topic ? `Wants to swap: ${r.topic.skill_name}` : "Sent you a swap request"}
                      </p>
                    </div>
                  </div>
                  {!isScheduling && (
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Accept"
                        disabled={isPending}
                        onClick={() => setSchedulingId(r.request_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                        style={{ background: "var(--sb-gradient)" }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        aria-label="Decline"
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
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: "1px solid #eef7f0" }}>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="nb-input px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      disabled={isPending || !scheduledTime}
                      onClick={() => confirmAccept(r.request_id)}
                      className="nb-btn px-4 py-1.5 text-xs text-white disabled:opacity-50"
                      style={{ background: "var(--sb-gradient)" }}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchedulingId(null);
                        setScheduledTime("");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold"
                      style={{ color: "var(--sb-muted)" }}
                    >
                      Cancel
                    </button>
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