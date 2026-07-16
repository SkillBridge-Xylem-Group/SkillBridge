import Link from "next/link";

const TABS: { key: "latest" | "popular" | "unanswered"; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "popular", label: "Popular" },
  { key: "unanswered", label: "Unanswered" },
];

export default function ForumTabs({ active, search }: { active: string; search?: string }) {
  return (
    <div className="flex items-center gap-6 border-b border-slate-100 px-6">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const params = new URLSearchParams();
        params.set("tab", tab.key);
        if (search) params.set("q", search);

        return (
          <Link
            key={tab.key}
            href={`/dashboard/forum?${params.toString()}`}
            className={`border-b-2 py-3 text-sm font-bold ${
              isActive ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}