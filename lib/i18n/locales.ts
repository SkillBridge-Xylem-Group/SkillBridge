export const LOCALE_STORAGE_KEY = "sb-locale";

export type AppLocale = "en" | "zh-CN" | "id" | "ja" | "ko";

export type LocaleOption = {
  code: AppLocale;
  /** Native endonym shown in the picker (Reddit-style). */
  label: string;
  englishName: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", label: "English", englishName: "English" },
  { code: "zh-CN", label: "简体中文", englishName: "Chinese (Simplified)" },
  { code: "id", label: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "ja", label: "日本語", englishName: "Japanese" },
  { code: "ko", label: "한국어", englishName: "Korean" },
];

export const DEFAULT_LOCALE: AppLocale = "en";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && LOCALE_OPTIONS.some((o) => o.code === value);
}

export function localeLabel(code: AppLocale | null | undefined): string {
  return LOCALE_OPTIONS.find((o) => o.code === code)?.label ?? "English";
}

export function htmlLang(code: AppLocale): string {
  return code;
}

/** BCP 47 tag for `Intl` / `toLocaleDateString` (matches app language setting). */
export function dateLocaleTag(code: AppLocale): string {
  switch (code) {
    case "en":
      return "en-US";
    case "zh-CN":
      return "zh-CN";
    default:
      return code;
  }
}

export function formatAppDate(
  iso: string | Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(dateLocaleTag(locale), options);
}

export function formatAppTime(
  iso: string | Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(dateLocaleTag(locale), options);
}

type RelativeTimeLabels = {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  monthsAgo?: string;
  yearsAgo?: string;
};

/** Compact relative time using dictionary labels (`{n}` placeholders). */
export function formatRelativeTimeLabel(
  iso: string,
  labels: RelativeTimeLabels,
  locale?: AppLocale
): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "";
  const mins = Math.floor(diffMs / 60_000);
  const fill = (template: string, n: number) => template.replace("{n}", String(n));
  if (mins < 1) return labels.justNow;
  if (mins < 60) return fill(labels.minutesAgo, mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fill(labels.hoursAgo, hours);
  const days = Math.floor(hours / 24);
  if (days < 30) return fill(labels.daysAgo, days);
  const months = Math.floor(days / 30);
  if (months < 12 && labels.monthsAgo) return fill(labels.monthsAgo, months);
  if (labels.yearsAgo) return fill(labels.yearsAgo, Math.max(1, Math.floor(months / 12)));
  if (locale) {
    return new Date(iso).toLocaleDateString(dateLocaleTag(locale), { month: "short", day: "numeric" });
  }
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
