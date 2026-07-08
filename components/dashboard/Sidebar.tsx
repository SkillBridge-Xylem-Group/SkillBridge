"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Repeat2, MessageSquare, MessagesSquare, Bell, User } from "lucide-react";
import YourProgress from "./YourProgress";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Browse People", href: "/dashboard/browse-people", icon: Users },
  { label: "Skill Swap Requests", href: "/dashboard/swap-requests", icon: Repeat2 },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Community Forum", href: "/dashboard/forum", icon: MessagesSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "My Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-6 py-8 lg:flex">
      <div>
        <Link href="/dashboard" className="text-xl font-extrabold text-brand">
          SkillBridge
        </Link>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <YourProgress />
    </aside>
  );
}