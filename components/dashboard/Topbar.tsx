"use client";
import { type LucideIcon, MessageSquare, Bell } from "lucide-react";
import UserMenu from "./UserMenu";

type TopbarProps = {
  userName: string;
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

export default function Topbar({ userName, level = "Level 0", xp = 0 }: TopbarProps) {
  return (
    <div className="flex items-center justify-end gap-4 px-6 py-6 sm:px-10">
      <IconWithBadge icon={MessageSquare} label="Messages" />
      <IconWithBadge icon={Bell} label="Notifications" />
      <UserMenu name={userName} level={level} xp={xp} />
    </div>
  );
}