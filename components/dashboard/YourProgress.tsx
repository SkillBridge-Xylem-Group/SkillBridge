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
  const xpGoal = 20;
  const xpIntoLevel = experiencePoints % xpGoal;
  const progress = Math.min(100, (xpIntoLevel / xpGoal) * 100);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Progress</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-900">Level {level}</span>
        <span className="text-xs font-semibold text-slate-400">
          {xpIntoLevel} / {xpGoal} XP
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Trust Score</p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {trustScore != null ? trustScore.toFixed(1) : "—"}
        </p>
        {trustScore == null && <p className="text-xs text-slate-400">No ratings yet</p>}
      </div>
    </div>
  );
}
