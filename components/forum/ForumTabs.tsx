import Link from "next/link";

const TABS: { key: "latest" | "popular" | "unanswered"; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "popular", label: "Popular" },
  { key: "unanswered", label: "Unanswered" },
];

export default function ForumTabs({ active, search }: { active: string; search?: string }) {
  return (
    <div className="flex items-center gap-6 px-6" style={{ borderBottom: "2.5px solid #f0ecfa" }}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const params = new URLSearchParams();
        params.set("tab", tab.key);
        if (search) params.set("q", search);

        return (
          <Link
            key={tab.key}
            href={`/dashboard/forum?${params.toString()}`}
            className="relative py-3 text-sm font-bold"
            style={{ color: isActive ? "var(--neu-indigo)" : "var(--neu-text-muted)" }}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full"
                style={{ background: "var(--neu-indigo)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}