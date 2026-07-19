"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type YourProgressProps = {
  level?: number;
  experiencePoints?: number;
  trustScore?: number | null;
};

/** FR-009: level up every 20 XP — show progress within the current level. */
export default function YourProgress({
  level = 0,
  experiencePoints = 0,
  trustScore = null,
}: YourProgressProps) {
  const { dictionary } = useLocale();
  const h = dictionary.home;
  const xpGoal = 20;
  const xpIntoLevel = experiencePoints % xpGoal;
  const progress = Math.min(100, (xpIntoLevel / xpGoal) * 100);

  return (
    <div className="nb-card-sm p-5" style={{ background: "#fbfaff" }}>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--neu-text-muted)" }}>
        {h.yourProgress}
      </p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-sm font-extrabold nb-heading">{interpolate(h.level, { n: level })}</span>
        <span className="text-xs font-semibold" style={{ color: "var(--neu-text-muted)" }}>
          {xpIntoLevel} / {xpGoal} XP
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: "#e9e4f7", border: "1.5px solid var(--neu-ink)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--neu-indigo)" }} />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--neu-text-muted)" }}>
          {h.trustScore}
        </p>
        <p className="mt-1 text-sm font-bold nb-heading">
          {trustScore != null ? trustScore.toFixed(1) : "—"}
        </p>
        {trustScore == null && <p className="text-xs" style={{ color: "var(--neu-text-muted)" }}>{h.noRatingsYet}</p>}
      </div>
    </div>
  );
}
