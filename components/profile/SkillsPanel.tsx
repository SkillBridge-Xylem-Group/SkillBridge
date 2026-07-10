"use client";

import { useState } from "react";
import { type LucideIcon, Plus, X, Search } from "lucide-react";
import type { Skill } from "@/lib/types/profile";

type SkillsPanelProps = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  skills: Skill[];
  /** The full SKILL catalog, minus skills already added, for the add-picker. */
  availableSkills: Skill[];
  onAdd: (skill: Skill) => void;
  onRemove: (skillId: number) => void;
};

export default function SkillsPanel({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  skills,
  availableSkills,
  onAdd,
  onRemove,
}: SkillsPanelProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = availableSkills.filter((s) =>
    s.skill_name.toLowerCase().includes(query.toLowerCase())
  );

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
            className="flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand"
          >
            {skill.skill_name}
            <button
              type="button"
              onClick={() => onRemove(skill.skill_id)}
              aria-label={`Remove ${skill.skill_name}`}
              className="text-brand/60 hover:text-brand"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {isPicking ? (
        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
            />
          </div>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {filtered.length === 0 && <p className="p-2 text-sm text-slate-400">No matching skills.</p>}
            {filtered.map((skill) => (
              <button
                key={skill.skill_id}
                type="button"
                onClick={() => {
                  onAdd(skill);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{skill.skill_name}</span>
                <span className="text-xs text-slate-400">{skill.category}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsPicking(false)}
            className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Done
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsPicking(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
        >
          <Plus size={14} />
          Add a skill
        </button>
      )}
    </div>
  );
}