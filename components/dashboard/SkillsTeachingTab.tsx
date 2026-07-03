import Link from "next/link";
import { Award, Palette, Code2, Plus } from "lucide-react";

export default function SkillsTeachingTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-brand" />
            <h2 className="text-lg font-extrabold text-slate-900">Achievements</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500">🛡️</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Top 1% Mentor</p>
                <p className="text-xs text-slate-400">Consistent 5-star reviews</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">⚡</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Fast Responder</p>
                <p className="text-xs text-slate-400">Replies in under 2 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Core Expertise</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Typography", "Tailwind CSS", "Figma", "JavaScript ES6", "Atomic Design"].map((t) => (
              <span key={t} className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand p-6 text-white shadow-lg shadow-brand/30">
            <Award size={24} />
            <p className="mt-4 text-3xl font-extrabold">124</p>
            <p className="text-sm text-white/85">Total Sessions</p>
          </div>
          <div className="rounded-2xl bg-brand-light p-6">
            <p className="text-3xl font-extrabold text-slate-900">4.9/5</p>
            <p className="text-sm text-slate-500">Average Rating</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Skills Offered</h2>
            <Link
              href="/dashboard/profile/add-skill?from=skills-teaching"
              className="flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
            >
              <Plus size={16} />
              New Skill
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <Palette size={20} className="text-brand" />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Expert</span>
              </div>
              <p className="mt-3 font-bold text-slate-900">UI/UX Design</p>
              <p className="mt-1 text-sm text-slate-500">
                Design systems, wireframing, high-fidelity prototyping, and user research methodologies.
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-400">45 mins</span>
                <span className="font-bold text-brand">$85/session</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <Code2 size={20} className="text-brand" />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Advanced</span>
              </div>
              <p className="mt-3 font-bold text-slate-900">React Development</p>
              <p className="mt-1 text-sm text-slate-500">
                Modern frontend architecture, state management (Redux/Zustand), and performance optimization.
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-400">60 mins</span>
                <span className="font-bold text-brand">$120/session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Growth Analytics</p>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">+12%</span>
          </div>
          <div className="mt-6 flex h-32 items-end gap-2">
            {[40, 30, 55, 45, 75, 65, 90].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${i === 6 ? "bg-emerald-500" : "bg-brand"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Profile views have increased by 340 this month. Keep your skills updated to maintain momentum.
          </p>
        </div>
      </div>
    </div>
  );
}