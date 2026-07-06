import { Search, PenLine } from "lucide-react";

const stats = [
  { value: "98%", label: "SUCCESS RATE" },
  { value: "50k+", label: "SESSIONS" },
  { value: "4.9/5", label: "AVG RATING" },
  { value: "120", label: "TOPICS" },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F5F6FE] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How SkillBridge Works</h2>
          <p className="mt-3 text-slate-500">A simple cycle of growth designed for professional connectivity.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* 01 */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-10 lg:col-span-3">
            <p className="text-6xl font-extrabold text-slate-100">01</p>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">Identify Your Edge</h3>
            <p className="mt-3 max-w-md text-slate-500">
              Everyone has a skill others need. Whether it&apos;s Python, Project Management, or Pottery—list your
              expertise and set your availability.
            </p>
            <a href="#" className="mt-4 inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
              List your skills →
            </a>
            <PenLine size={90} className="absolute -bottom-4 -right-4 text-slate-100" strokeWidth={1} />
          </div>

          {/* 02 */}
          <div className="relative overflow-hidden rounded-3xl bg-brand p-10 text-white lg:col-span-2">
            <p className="text-6xl font-extrabold text-white/20">02</p>
            <h3 className="mt-4 text-xl font-extrabold">Find Your Gap</h3>
            <p className="mt-3 text-white/85">
              Browse our curated library of skills and connect with a mentor who actually practices what they
              teach.
            </p>
            <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/50">
              <Search size={22} />
            </div>
          </div>

          {/* 03 */}
          <div className="rounded-3xl bg-emerald-300 p-10 lg:col-span-2">
            <p className="text-6xl font-extrabold text-white/40">03</p>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">The Swap</h3>
            <p className="mt-3 text-slate-800">
              Book a 1-on-1 session. No money changes hands—your &lsquo;credit&rsquo; is the session you teach to
              someone else.
            </p>
            <div className="mt-8">
              <div className="h-2 w-full rounded-full bg-slate-900/10">
                <div className="h-2 w-3/4 rounded-full bg-slate-900" />
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">Swap Credits Earned: 1.5hrs</p>
            </div>
          </div>

          {/* 04 */}
          <div className="rounded-3xl border border-slate-100 bg-white p-10 lg:col-span-3">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-6xl font-extrabold text-slate-100">04</p>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900">Grow Together</h3>
                <p className="mt-3 max-w-xs text-slate-500">
                  Expand your network, build a portfolio of testimonials, and master new domains with structured
                  progress tracking.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-brand-light px-6 py-4 text-center">
                    <p className="text-lg font-extrabold text-brand">{s.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}