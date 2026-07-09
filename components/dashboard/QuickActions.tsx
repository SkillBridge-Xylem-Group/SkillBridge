import Link from "next/link";
import { type LucideIcon, Users, Sparkles, MessagesSquare, Repeat2, ChevronRight } from "lucide-react";

type Action = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  href: string;
};

const actions: Action[] = [
  {
    icon: Users,
    iconBg: "bg-brand-light",
    iconColor: "text-brand",
    title: "Find People to Learn From",
    desc: "Browse skills and connect",
    href: "/dashboard/browse-people",
  },
  {
    icon: Sparkles,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Offer Your Skills",
    desc: "Teach and help others grow",
    href: "/dashboard/profile",
  },
  {
    icon: MessagesSquare,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Community Forum",
    desc: "Ask questions and share knowledge",
    href: "/dashboard/forum",
  },
  {
    icon: Repeat2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    title: "My Swap Requests",
    desc: "View your incoming & outgoing requests",
    href: "/dashboard/swap-requests",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-900">Quick Actions</h2>

      <div className="mt-4 space-y-1">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              href={a.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{a.title}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-slate-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}