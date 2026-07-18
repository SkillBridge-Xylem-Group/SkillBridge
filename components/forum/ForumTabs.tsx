import Link from "next/link";

const TABS: { key: "latest" | "popular" | "unanswered"; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "popular", label: "Popular" },
  { key: "unanswered", label: "Unanswered" },
];

type ForumTabsProps = {
  active: string;
  search?: string;
  /** Base path for tab links, e.g. /dashboard/forum/c/data-science */
  basePath?: string;
};

export default function ForumTabs({ active, search, basePath = "/dashboard/forum" }: ForumTabsProps) {
  return (
    <div className="flex items-center gap-7 px-6" style={{ borderBottom: "1px solid #eef7f0" }}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const params = new URLSearchParams();
        params.set("tab", tab.key);
        if (search) params.set("q", search);

        return (
          <Link
            key={tab.key}
            href={`${basePath}?${params.toString()}`}
            className="relative py-3 text-[15px] font-bold"
            style={{ color: isActive ? "var(--sb-teal-dark)" : "var(--sb-muted)" }}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute inset-x-0 -bottom-[1px] h-[3px] rounded-full"
                style={{ background: "var(--sb-gradient)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
