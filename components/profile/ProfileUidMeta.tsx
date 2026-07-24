"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

export default function ProfileUidMeta({ publicUid }: { publicUid: number | null }) {
  const { dictionary } = useLocale();
  const p = dictionary.profile;
  const [copied, setCopied] = useState(false);

  if (publicUid == null) return null;

  const uidText = interpolate(p.userUid, { uid: String(publicUid) });

  async function copyUid() {
    try {
      await navigator.clipboard.writeText(String(publicUid));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--sb-muted)" }}>
        {uidText}
      </span>
      <button
        type="button"
        onClick={() => void copyUid()}
        aria-label={copied ? p.uidCopied : p.copyUid}
        title={copied ? p.uidCopied : p.copyUid}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
        style={{ color: copied ? "var(--sb-teal-dark)" : "var(--sb-muted)" }}
      >
        {copied ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2} />}
      </button>
    </div>
  );
}
