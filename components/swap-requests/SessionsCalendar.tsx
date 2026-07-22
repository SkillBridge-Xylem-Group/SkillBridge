"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { dateLocaleTag } from "@/lib/i18n/locales";

type SessionsCalendarProps = {
  /** ISO date/datetime strings for every session that has a scheduled time. */
  scheduledDates: string[];
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function SessionsCalendar({ scheduledDates }: SessionsCalendarProps) {
  const { locale, dictionary } = useLocale();
  const s = dictionary.swapSession;
  const localeTag = dateLocaleTag(locale);
  const dowLabels = Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, i + 1).toLocaleDateString(localeTag, { weekday: "narrow" })
  );
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const eventDays = new Set(
    scheduledDates
      .map((iso) => new Date(iso))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => dateKey(d))
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(localeTag, { month: "long", year: "numeric" });

  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; muted: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), muted: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, muted: true });
  }

  function goPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function goNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>{monthLabel}</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={goPrevMonth}
            aria-label={s.prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            aria-label={s.nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {dowLabels.map((d, i) => (
          <div key={i} className="pb-1.5 text-[11px] font-bold" style={{ color: "var(--sb-muted)" }}>
            {d}
          </div>
        ))}
        {cells.map(({ date, muted }, i) => {
          const isToday = !muted && dateKey(date) === dateKey(today);
          const hasEvent = !muted && eventDays.has(dateKey(date));
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[13px]"
                style={{
                  color: muted ? "#d1d5db" : isToday ? "#fff" : hasEvent ? "#b45309" : "var(--sb-ink)",
                  background: isToday ? "var(--sb-gradient)" : hasEvent ? "#fff6d9" : "transparent",
                  fontWeight: isToday || hasEvent ? 800 : 600,
                }}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium" style={{ color: "var(--sb-muted)" }}>
        <span className="h-2.5 w-2.5 shrink-0 rounded" style={{ background: "#fff6d9", border: "1.5px solid #b45309" }} />
        {s.scheduledLegend}
      </div>
    </div>
  );
}
