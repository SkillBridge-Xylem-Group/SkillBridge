"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Search } from "lucide-react";
import type { TimezoneOption } from "@/lib/timezones";
import { useLocale } from "@/components/i18n/LocaleProvider";

type TimezoneComboboxProps = {
  value: string;
  options: TimezoneOption[];
  onChange: (value: string) => void;
};

/** Searchable "pick your city" combobox — replaces a long native scroll list. */
export default function TimezoneCombobox({ value, options, onChange }: TimezoneComboboxProps) {
  const { dictionary } = useLocale();
  const o = dictionary.onboarding;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openAndFocus() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSelect(option: TimezoneOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <Globe size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--sb-muted)" }} />
      <button
        type="button"
        onClick={openAndFocus}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="nb-input flex w-full items-center py-3.5 pl-11 pr-4 text-left text-sm"
      >
        <span className="truncate">{selected?.label ?? o.searchCity}</span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "var(--sb-shadow-lg)" }}
        >
          <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderBottom: "1px solid #eef7f0" }}>
            <Search size={15} style={{ color: "var(--sb-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={o.typeCityName}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--sb-ink)" }}
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--sb-muted)" }}>{o.noCitiesFound}</p>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    className="block w-full px-4 py-2.5 text-left text-sm transition hover:bg-[var(--sb-emerald-light)]"
                    style={{
                      color: isSelected ? "var(--sb-teal-dark)" : "var(--sb-ink)",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
