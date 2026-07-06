import Link from "next/link";
import { Sparkles, Code2, LayoutGrid, Megaphone, Mail } from "lucide-react";

const mastering = [
  { icon: Sparkles, title: "Motion Design & After Effects", color: "bg-brand text-white" },
  { icon: Code2, title: "Full-stack React (Next.js 14)", color: "bg-brand-light text-brand" },
  { icon: LayoutGrid, title: "Web3 & Smart Contract Design", color: "bg-orange-50 text-orange-500" },
];

const mentors = [
  { name: "David Chen", role: "Web3 Specialist" },
  { name: "Sarah Jenkins", role: "Motion Lead" },
];

export default function SkillsLearningTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Currently Mastering</h2>
          <div className="mt-4 space-y-3">
            {mastering.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                    <Icon size={18} />
                  </div>
                  <p className="font-bold text-slate-900">{m.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-emerald-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Seeking Mentors</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Elena is actively looking for guidance in these high-priority areas. If you&apos;re an expert, reach out!
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Web3 Security", "Serverless Architecture", "Product Strategy"].map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t}
                <Mail size={14} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recommended Mentors</p>
          <div className="mt-4 space-y-4">
            {mentors.map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/profile/recommended-mentors"
            className="btn-pill mt-5 block w-full border-2 border-slate-200 py-2.5 text-center text-sm font-bold text-slate-700 hover:border-brand hover:text-brand"
          >
            View All Recommendations
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">This Week&apos;s Activity</p>
          <div className="mt-4 flex h-24 items-end gap-2">
            {[30, 45, 35, 40, 90, 25, 20].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t ${i === 4 ? "bg-brand" : "bg-brand-light"}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Total Hours</span>
            <span className="font-bold text-slate-900">12.5 hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}