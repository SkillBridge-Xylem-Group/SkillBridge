"use client";

import { useState } from "react";
import { type LucideIcon, Plus, X, Search } from "lucide-react";
import type { Skill } from "@/lib/types/profile";

type SkillsPanelProps = {
  icon: LucideIcon;
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
    <div className="nb-card p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconColor, border: "2px solid var(--neu-ink)", color: "#fff" }}
        >
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--neu-ink)" }}>{title}</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length === 0 && <p className="text-sm" style={{ color: "var(--neu-text-muted)" }}>None added yet.</p>}
        {skills.map((skill) => (
          <span key={skill.skill_id} className="nb-tag flex items-center gap-1.5">
            {skill.skill_name}
            <button
              type="button"
              onClick={() => onRemove(skill.skill_id)}
              aria-label={`Remove ${skill.skill_name}`}
              className="opacity-60 hover:opacity-100"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {isPicking ? (
        <div className="mt-4 rounded-xl p-3" style={{ border: "2px solid var(--neu-ink)" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#f3eefc" }}>
            <Search size={14} style={{ color: "var(--neu-text-muted)" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: "var(--neu-ink)" }}
            />
          </div>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {filtered.length === 0 && <p className="p-2 text-sm" style={{ color: "var(--neu-text-muted)" }}>No matching skills.</p>}
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
                <span className="font-medium" style={{ color: "var(--neu-ink)" }}>{skill.skill_name}</span>
                <span className="text-xs" style={{ color: "var(--neu-text-muted)" }}>{skill.category}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsPicking(false)}
            className="mt-2 text-xs font-semibold hover:underline"
            style={{ color: "var(--neu-text-muted)" }}
          >
            Done
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsPicking(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-bold hover:underline"
          style={{ color: "var(--neu-indigo)" }}
        >
          <Plus size={14} />
          Add a skill
        </button>
      )}
    </div>
  );
}