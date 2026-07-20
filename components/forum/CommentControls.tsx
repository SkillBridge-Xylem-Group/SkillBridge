"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { CommentSort } from "@/lib/forum";
import { useLocale } from "@/components/i18n/LocaleProvider";

const SORT_OPTIONS: CommentSort[] = ["best", "new", "old"];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sortLabels: Record<CommentSort, string> = {
    best: f.sortBest,
    new: f.sortNew,
    old: f.sortOld,
  };

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  function pick(next: CommentSort) {
    onSortChange(next);
    setMenuOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div ref={menuRef} className="relative inline-flex items-center gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--sb-muted)" }}>
          {f.sortBy}
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-3 pr-2.5 text-sm font-bold transition hover:bg-slate-200"
          style={{ color: "var(--sb-ink)" }}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
        >
          {sortLabels[sort]}
          <ChevronDown size={14} style={{ color: "var(--sb-muted)" }} />
        </button>
        {menuOpen ? (
          <ul
            role="listbox"
            aria-label={f.sortBy}
            className="absolute left-0 top-full z-30 mt-1 min-w-[8.5rem] overflow-hidden rounded-xl bg-white py-1"
            style={{ boxShadow: "var(--sb-shadow-lg)" }}
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option} role="option" aria-selected={sort === option}>
                <button
                  type="button"
                  onClick={() => pick(option)}
                  className={`flex w-full px-3 py-2 text-left text-sm font-semibold transition ${
                    sort === option
                      ? "bg-[color:var(--sb-teal)] text-white"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {sortLabels[option]}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
