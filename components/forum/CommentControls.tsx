"use client";

import { ChevronDown, Search } from "lucide-react";
import type { CommentSort } from "@/lib/forum";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function CommentControls({
  sort,
  onSortChange,
  search,
  onSearchChange,
}: {
  sort: CommentSort;
  onSortChange: (sort: CommentSort) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--sb-muted)" }}>
          {f.sortBy}
        </span>
        <span className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CommentSort)}
            className="appearance-none rounded-full border-0 bg-slate-100 py-1.5 pl-3 pr-8 text-sm font-bold outline-none"
            style={{ color: "var(--sb-ink)" }}
          >
            <option value="best">{f.sortBest}</option>
            <option value="new">{f.sortNew}</option>
            <option value="old">{f.sortOld}</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--sb-muted)" }}
          />
        </span>
      </label>

      <label className="relative min-w-[12rem] flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--sb-muted)" }}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={f.searchComments}
          className="w-full rounded-full border-0 bg-slate-100 py-1.5 pl-9 pr-3 text-sm outline-none"
          style={{ color: "var(--sb-ink)" }}
        />
      </label>
    </div>
  );
}
