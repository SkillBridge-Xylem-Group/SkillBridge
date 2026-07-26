"use client";

import { useState, useTransition } from "react";
import { adminGenerateActivationLinkAction } from "@/lib/actions/admin";

type ActivationActionsProps = {
  email: string;
};

/** Shown only for unconfirmed users on the admin Users page (BUG-020). */
export default function ActivationActions({ email }: ActivationActionsProps) {
  const [isLinkPending, startLink] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);

  function handleGenerateLink() {
    setError(null);
    setStatus(null);
    setManualLink(null);
    startLink(async () => {
      const result = await adminGenerateActivationLinkAction({ email });
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (!result?.link) return;

      try {
        await navigator.clipboard.writeText(result.link);
        setStatus("Link copied to clipboard.");
      } catch {
        // Clipboard API needs HTTPS or localhost — fall back to showing the raw link.
        setManualLink(result.link);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleGenerateLink}
        disabled={isLinkPending}
        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
      >
        {isLinkPending ? "Generating..." : "Copy link"}
      </button>

      {status && <p className="text-xs text-emerald-600">{status}</p>}
      {error && <p className="max-w-[220px] text-right text-xs text-red-600">{error}</p>}

      {manualLink && (
        <div className="max-w-[260px] rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="mb-1 text-[11px] text-slate-500">
            Clipboard unavailable — copy manually:
          </p>
          <input
            type="text"
            readOnly
            value={manualLink}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700"
          />
        </div>
      )}
    </div>
  );
}
