import { type LucideIcon } from "lucide-react";
import type { Skill } from "@/lib/types/profile";

type SkillChipListProps = {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  skills: Skill[];
};

/** Read-only skill chips — used on public profiles where nothing is editable. */
export default function SkillChipList({ icon: Icon, iconColor, title, skills }: SkillChipListProps) {
  return (
    <div className="nb-card p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconColor, color: "#fff" }}
        >
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>{title}</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length === 0 && <p className="text-sm" style={{ color: "var(--sb-muted)" }}>None added yet.</p>}
        {skills.map((skill) => (
          <span key={skill.skill_id} className="nb-tag">
            {skill.skill_name}
          </span>
        ))}
      </div>
    </div>
  );
}
