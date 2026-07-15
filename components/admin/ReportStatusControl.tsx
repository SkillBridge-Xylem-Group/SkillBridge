"use client";

import { useState, useTransition } from "react";
import { updateReportStatusAction } from "@/lib/actions/admin";

type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "pending", label: "Mark Pending" },
  { value: "reviewed", label: "Mark Reviewed" },
  { value: "dismissed", label: "Dismiss" },
  { value: "actioned", label: "Mark Actioned" },
];

type ReportStatusControlProps = {
  reportId: string;
  currentStatus: string;
};

export default function ReportStatusControl({ reportId, currentStatus }: ReportStatusControlProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(status: ReportStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateReportStatusAction({ reportId, status });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value=""
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.value as ReportStatus;
          if (value) handleChange(value);
        }}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-60"
      >
        <option value="" disabled>
          {isPending ? "Saving..." : "Update status"}
        </option>
        {STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}