"use client";

import { type LucideIcon, Search, MessageSquare, Bell } from "lucide-react";
import UserMenu from "./UserMenu";

type TopbarProps = {
  userName: string;
  avatarId?: string | null;
  level?: string;
  xp?: number;
};

function IconWithBadge({ icon: Icon, label, badge }: { icon: LucideIcon; label: string; badge?: number }) {
  return (
    <button
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
    >
      <Icon size={20} />
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function Topbar({ userName, avatarId, level = "Level 0", xp = 0 }: TopbarProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-6 sm:px-10">
      <div className="relative flex-1">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search skills, people, or categories..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <IconWithBadge icon={MessageSquare} label="Messages" />
      <IconWithBadge icon={Bell} label="Notifications" />

      <UserMenu name={userName} level={level} xp={xp} avatarId={avatarId} />
    </div>
  );
}