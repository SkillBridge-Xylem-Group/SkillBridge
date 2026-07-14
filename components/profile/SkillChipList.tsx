import { type LucideIcon } from "lucide-react";
import type { Skill } from "@/lib/types/profile";

type SkillChipListProps = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  skills: Skill[];
};

/** Read-only skill chips — used on public profiles where nothing is editable. */
export default function SkillChipList({ icon: Icon, iconBg, iconColor, title, skills }: SkillChipListProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length === 0 && <p className="text-sm text-slate-400">None added yet.</p>}
        {skills.map((skill) => (
          <span
            key={skill.skill_id}
            className="rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand"
          >
            {skill.skill_name}
          </span>
        ))}
      </div>
    </div>
  );
}
