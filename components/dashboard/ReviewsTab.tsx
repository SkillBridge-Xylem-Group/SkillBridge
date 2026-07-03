const reviews = [
  {
    name: "Sarah Jenkins",
    role: "Front-end Developer",
    rating: 5,
    date: "Oct 12, 2023",
    text: "Working with Elena was incredibly productive. She has a unique way of breaking down complex React concepts into manageable pieces.",
    tags: ["React Optimization", "Mentorship"],
  },
  {
    name: "David Chen",
    role: "Product Designer",
    rating: 5,
    date: "Sept 28, 2023",
    text: "Elena helped me bridge the gap between design and engineering. Her sessions on CSS architecture and SVG animations were eye-opening.",
    tags: ["Design-to-Code", "Patient"],
  },
];

const distribution = [
  { star: 5, pct: 92 },
  { star: 4, pct: 6 },
  { star: 3, pct: 1 },
];

export default function ReviewsTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {reviews.map((r) => (
          <div key={r.name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">{r.name}</p>
                  <p className="text-sm text-slate-400">{r.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400">{"★".repeat(r.rating)}</p>
                <p className="text-xs text-slate-400">{r.date}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{r.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.tags.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-extrabold text-slate-900">Overall Rating</h2>
        <p className="mt-2 text-4xl font-extrabold text-brand">4.9</p>
        <p className="text-amber-400">★★★★★</p>
        <p className="mt-1 text-sm text-slate-400">Based on 128 verified reviews</p>

        <div className="mt-6 space-y-3">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-sm">
              <span className="w-3 text-slate-500">{d.star}</span>
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-10 text-right text-slate-400">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}