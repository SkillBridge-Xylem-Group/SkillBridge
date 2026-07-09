import { Award } from "lucide-react";
import { xpForNextLevel } from "@/lib/types/profile";

type LevelCardProps = {
  level: number;
  experiencePoints: number;
};

// FR-009: 1 XP per completed teaching session; level up every 20 points
// (20 = Level 1, 40 = Level 2, ...).
export default function LevelCard({ level, experiencePoints }: LevelCardProps) {
  const pointsIntoLevel = experiencePoints % 20;
  const nextLevelAt = xpForNextLevel(level);
  const progress = Math.min(100, (pointsIntoLevel / 20) * 100);
  const remaining = Math.max(0, nextLevelAt - experiencePoints);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
          <Award size={20} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Level</h2>
      </div>

      <p className="mt-4 text-4xl font-extrabold text-slate-900">{level}</p>

      <p className="mt-2 text-sm font-semibold text-slate-400">
        {experiencePoints} / {nextLevelAt} XP
      </p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {remaining} XP until Level {level + 1}
      </p>
    </div>
  );
}