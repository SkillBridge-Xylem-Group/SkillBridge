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
      await respondToRequestAction(requestId, "accepted", new Date(scheduledTime).toISOString());
      setSchedulingId(null);
      setScheduledTime("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-900">Pending Requests</h2>

      {requests.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No pending requests right now.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {requests.map((r) => {
            const initials = r.partner.fullname
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p.charAt(0).toUpperCase())
              .join("");
            const isScheduling = schedulingId === r.request_id;

            return (
              <div key={r.request_id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{r.partner.fullname}</p>
                      <p className="text-sm text-slate-500">
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
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 text-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        aria-label="Decline"
                        disabled={isPending}
                        onClick={() => decline(r.request_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isScheduling && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isPending || !scheduledTime}
                      onClick={() => confirmAccept(r.request_id)}
                      className="btn-pill bg-brand px-4 py-1.5 text-xs text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchedulingId(null);
                        setScheduledTime("");
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
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