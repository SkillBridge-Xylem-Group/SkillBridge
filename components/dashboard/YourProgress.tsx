type YourProgressProps = {
  level?: number;
  xp?: number;
  xpGoal?: number;
  trustScore?: string;
};

export default function YourProgress({ level = 0, xp = 0, xpGoal = 20, trustScore }: YourProgressProps) {
  const progress = Math.min(100, (xp / xpGoal) * 100);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Progress</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-slate-900">Level {level}</span>
        <span className="text-xs font-semibold text-slate-400">
          {xp} / {xpGoal} XP
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Trust Score</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{trustScore ?? "—"}</p>
        {!trustScore && <p className="text-xs text-slate-400">No ratings yet</p>}
      </div>
    </div>
  );
}