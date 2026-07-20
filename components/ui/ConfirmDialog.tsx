"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** In-app confirm dialog — replaces browser window.confirm for consistent UI. */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  busyLabel = "Working…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        aria-busy={busy}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
      >
        {busy ? (
          <div
            className={`h-1 w-full animate-pulse ${danger ? "bg-red-400" : "bg-brand/70"}`}
            aria-hidden
          />
        ) : (
          <div className="h-1 w-full bg-transparent" aria-hidden />
        )}
        <div className="px-5 pt-4 pb-2">
          <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
            {title}
          </h3>
          <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition disabled:opacity-80 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden />
                <span>{busyLabel}</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
