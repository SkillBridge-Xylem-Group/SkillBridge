"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

const TAB_KEYS = ["latest", "popular", "unanswered"] as const;

type ForumTabsProps = {
  active: string;
  search?: string;
  /** Base path for tab links, e.g. /dashboard/forum/c/data-science */
  basePath?: string;
};

export default function ForumTabs({ active, search, basePath = "/dashboard/forum" }: ForumTabsProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const labels: Record<(typeof TAB_KEYS)[number], string> = {
    latest: f.latest,
    popular: f.popular,
    unanswered: f.unanswered,
  };

  return (
    <div className="flex items-center gap-7 px-6" style={{ borderBottom: "1px solid #eef7f0" }}>
      {TAB_KEYS.map((key) => {
        const isActive = active === key;
        const params = new URLSearchParams();
        params.set("tab", key);
        if (search) params.set("q", search);

        return (
          <Link
            key={key}
            href={`${basePath}?${params.toString()}`}
            className="relative py-3 text-[15px] font-bold"
            style={{ color: isActive ? "var(--sb-teal-dark)" : "var(--sb-muted)" }}
          >
            {labels[key]}
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
