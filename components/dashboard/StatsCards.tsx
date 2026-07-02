type Stat = {
  label: string;
  value: string;
  sub: string;
  subClassName?: string;
};

const stats: Stat[] = [
  { label: "Experience Points", value: "12,450", sub: "+120 today", subClassName: "text-emerald-600" },
  { label: "Current Level", value: "Level 12", sub: "850 XP to Level 13" },
  { label: "Trust Score", value: "98%", sub: "Top 5%", subClassName: "text-emerald-600" },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {s.label}
          </p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{s.value}</p>
          <p className={`mt-1 text-sm font-semibold text-slate-500 ${s.subClassName ?? ""}`}>
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
}