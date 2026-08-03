import Image from "next/image";
import {
  Building2,
  Home,
  Layers,
  MessageSquare,
  Repeat,
  Search,
  Star,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Browse" },
  { icon: Repeat, label: "Swaps" },
  { icon: MessageSquare, label: "Forum" },
] as const;

const STATS = [
  { icon: MessageSquare, value: "12", label: "Discussions", bg: "#dcfce7", color: "#16a34a" },
  { icon: Users, value: "8", label: "Connections", bg: "#ede9fe", color: "#6d28d9" },
  { icon: Repeat, value: "5", label: "Skill Swaps", bg: "#fef3c7", color: "#b45309" },
  { icon: Star, value: "4.8", label: "Reputation", bg: "#cffafe", color: "#0e7490" },
] as const;

/** Static mini replica of the logged-in dashboard for the landing-page browser mockup. */
export default function ShowcaseDashboardPreview() {
  return (
    <div className="flex h-[320px] overflow-hidden bg-[#f4f7f5] text-left sm:h-[360px]">
      <aside
        className="hidden w-[148px] shrink-0 flex-col border-r border-slate-100 bg-white px-2.5 py-3 sm:flex"
        style={{ boxShadow: "2px 0 12px rgba(15,23,42,0.04)" }}
      >
        <div className="mb-4 flex items-center gap-2 px-1">
          <Image src="/images/logo-mark-v2.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
          <span className="truncate text-sm font-extrabold text-slate-900">SkillBridge</span>
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold ${
                active ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-slate-50 px-2.5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Communities</p>
          <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">Education & Career</p>
          <p className="truncate text-[11px] font-semibold text-slate-700">Design & Creative</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden p-3 sm:p-4">
        <div
          className="rounded-2xl p-3 sm:p-4"
          style={{ background: "linear-gradient(135deg, #22c55e, #14b8a6)", boxShadow: "0 8px 24px rgba(34,197,94,0.22)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-white text-sm font-extrabold text-emerald-700">
              SM
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white sm:text-base">Sofia Martinez</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">Level 3</span>
                <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Star size={9} className="fill-white text-white" />
                  4.8
                </span>
              </div>
            </div>
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-lg font-extrabold text-white">6</p>
                <p className="text-[10px] font-semibold text-white/80">Skills shared</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-white">3</p>
                <p className="text-[10px] font-semibold text-white/80">Communities</p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-semibold text-white/80">
              <span>Progress to Level 4</span>
              <span>65%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-[65%] rounded-full bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label, bg, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5"
              style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: bg, color }}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-none text-slate-900">{value}</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-3" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <p className="text-[11px] font-extrabold text-slate-900">Top Rated Members</p>
            <div className="mt-2 space-y-2">
              {[
                { name: "Kiran P.", skill: "Piano", rating: "4.9" },
                { name: "Alex T.", skill: "Data Viz", rating: "4.7" },
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">{member.name}</p>
                    <p className="truncate text-[10px] text-slate-500">Teaches {member.skill}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">★ {member.rating}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <p className="text-[11px] font-extrabold text-slate-900">Trending Communities</p>
            <div className="mt-2 space-y-2">
              {[
                { title: "Education & Career", members: "128", icon: Layers },
                { title: "Design & Creative", members: "96", icon: Building2 },
              ].map(({ title, members, icon: Icon }) => (
                <div key={title} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {title.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-800">{title}</p>
                    <p className="text-[10px] text-slate-500">{members} members</p>
                  </div>
                  <Icon size={12} className="shrink-0 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
