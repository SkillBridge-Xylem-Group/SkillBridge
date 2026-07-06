import { GraduationCap, Clock } from "lucide-react";

export default function AboutTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Certifications</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">🏅</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Google UX Master</p>
                <p className="text-xs text-slate-400">Issued Jan 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">🎖️</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Design Leadership</p>
                <p className="text-xs text-slate-400">Issued Nov 2022</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Badges</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">Top Mentor</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Quick Responder</span>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">50+ Sessions</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand p-6 text-white shadow-lg shadow-brand/30">
            <GraduationCap size={24} />
            <p className="mt-4 text-3xl font-extrabold">128</p>
            <p className="text-sm text-white/85">Students Guided</p>
          </div>
          <div className="rounded-2xl bg-brand-light p-6">
            <Clock size={24} className="text-brand" />
            <p className="mt-4 text-3xl font-extrabold text-slate-900">4.9/5</p>
            <p className="text-sm text-slate-500">Average Rating</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-slate-700">
                Completed a 1:1 session with <span className="font-bold text-brand">Marcus Aurelius</span> on Figma Component Architecture.
              </p>
              <p className="mt-1 text-xs text-slate-400">2 hours ago</p>
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Published a new skill: <span className="font-bold text-brand">&ldquo;Enterprise Design Systems&rdquo;</span>.
              </p>
              <p className="mt-1 text-xs text-slate-400">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}