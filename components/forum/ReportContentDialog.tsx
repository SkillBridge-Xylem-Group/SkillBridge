"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import {
  REPORT_REASON_KEYS,
  type ReportReasonKey,
} from "@/lib/forumReportReasons";
import { useLocale } from "@/components/i18n/LocaleProvider";

type ReportContentDialogProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (payload: { reasonKey: ReportReasonKey; details: string }) => void;
};

export default function ReportContentDialog({
  open,
  busy = false,
  onClose,
  onSubmit,
}: ReportContentDialogProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [reasonKey, setReasonKey] = useState<ReportReasonKey>("spam");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const reasonLabels: Record<ReportReasonKey, string> = {
    spam: f.reportReasonSpam,
    harassment: f.reportReasonHarassment,
    hate: f.reportReasonHate,
    inappropriate: f.reportReasonInappropriate,
    misinformation: f.reportReasonMisinformation,
    other: f.reportReasonOther,
  };

  useEffect(() => {
    if (!open) return;
    setReasonKey("spam");
    setDetails("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  function handleSubmit() {
    if (!reasonKey) {
      setError(f.reportSelectReason);
      return;
    }
    if (reasonKey === "other" && details.trim().length < 5) {
      setError(f.reportDetailsRequired);
      return;
    }
    setError("");
    onSubmit({ reasonKey, details: details.trim() });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40"
        disabled={busy}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Flag size={18} style={{ color: "var(--sb-teal-dark)" }} />
            <h3 id="report-dialog-title" className="text-base font-bold text-slate-900">
              {f.reportDialogTitle}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-600">{f.reportDialogSubtitle}</p>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {f.reportSelectReason}
            </legend>
            {REPORT_REASON_KEYS.map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                  reasonKey === key
                    ? "border-[color:var(--sb-teal)] bg-[color-mix(in_srgb,var(--sb-teal)_8%,white)]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={key}
                  checked={reasonKey === key}
                  onChange={() => {
                    setReasonKey(key);
                    setError("");
                  }}
                  className="mt-0.5"
                />
                <span className="text-sm font-medium text-slate-800">{reasonLabels[key]}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="report-details" className="text-sm font-semibold text-slate-800">
              {reasonKey === "other" ? f.reportDetailsRequiredLabel : f.reportDetailsLabel}
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setError("");
              }}
              rows={4}
              maxLength={500}
              placeholder={f.reportDetailsPlaceholder}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[color:var(--sb-teal)]"
            />
            {reasonKey === "other" ? (
              <p className="mt-1 text-xs text-slate-500">{f.reportDetailsRequiredHint}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">{f.reportDetailsOptionalHint}</p>
            )}
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {dictionary.common.cancel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSubmit}
            className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? f.reportSubmitting : f.reportSubmit}
          </button>
        </div>
      </div>
    </div>
  );
}
