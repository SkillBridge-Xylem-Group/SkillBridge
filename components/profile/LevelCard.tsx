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
    <div className="nb-card-sm p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--neu-indigo)", border: "2px solid var(--neu-ink)" }}
        >
          <Award size={20} />
        </div>
        <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--neu-ink)" }}>Level</h2>
      </div>

      <p className="mt-4 text-4xl font-extrabold nb-heading" style={{ color: "var(--neu-ink)" }}>{level}</p>

      <p className="mt-2 text-sm font-semibold" style={{ color: "var(--neu-text-muted)" }}>
        {experiencePoints} / {nextLevelAt} XP
      </p>
      <div className="mt-2 h-2.5 w-full rounded-full" style={{ background: "#f0ecfa", border: "1.5px solid var(--neu-ink)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--neu-indigo)" }} />
      </div>

      <p className="mt-3 text-sm" style={{ color: "var(--neu-text-muted)" }}>
        {remaining} XP until Level {level + 1}
      </p>
    </div>
  );
}