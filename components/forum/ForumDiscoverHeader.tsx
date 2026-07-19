"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ForumDiscoverHeader() {
  const { dictionary } = useLocale();
  const f = dictionary.forum;

  return (
    <div>
      <h1 className="text-2xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
        {f.discoverTitle}
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
        {f.discoverSubtitle}
      </p>
    </div>
  );
}
