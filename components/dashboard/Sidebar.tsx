"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  Repeat2,
  MessageSquare,
  MessagesSquare,
  Bell,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Browse Skills", href: "/dashboard/browse-skills", icon: Compass },
  { label: "Sessions", href: "/dashboard/sessions", icon: Repeat2 },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Forum", href: "/dashboard/forum", icon: MessagesSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    // TODO: hubungkan ke API auth (clear session/token) sebelum redirect.
    router.push("/login");
  }

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
                  isActive
                    ? "bg-brand-light text-brand"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  );
}