type Update = {
  tag: string;
  tagColor: string;
  title: string;
  meta: string;
};

const updates: Update[] = [
  {
    tag: "TRENDING TOPIC",
    tagColor: "text-brand",
    title: "Future of AI in Frontend Development",
    meta: "124 comments · 12 min read",
  },
  {
    tag: "NEW SKILL ADDED",
    tagColor: "text-emerald-600",
    title: "Advanced WebAssembly with Rust",
    meta: "Be among the first to master this.",
  },
  {
    tag: "FORUM SPOTLIGHT",
    tagColor: "text-orange-500",
    title: "Best practices for multi-tenant SaaS",
    meta: "Started by TechLead_99",
  },
];

export default function CommunityUpdates() {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-slate-900">Community Updates</h2>

      <div className="mt-5 space-y-5">
        {updates.map((u) => (
          <div key={u.title}>
            <p className={`text-xs font-bold tracking-widest ${u.tagColor}`}>{u.tag}</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{u.title}</p>
            <p className="mt-0.5 text-sm text-slate-500">{u.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}