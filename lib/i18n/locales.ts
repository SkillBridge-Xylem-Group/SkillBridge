export const LOCALE_STORAGE_KEY = "sb-locale";

export type AppLocale =
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "id"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt-BR"
  | "th"
  | "vi"
  | "ms"
  | "hi"
  | "ar";

export type LocaleOption = {
  code: AppLocale;
  /** Native endonym shown in the picker (Reddit-style). */
  label: string;
  englishName: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", label: "English", englishName: "English" },
  { code: "zh-CN", label: "简体中文", englishName: "Chinese (Simplified)" },
  { code: "zh-TW", label: "繁體中文", englishName: "Chinese (Traditional)" },
  { code: "id", label: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "ms", label: "Bahasa Melayu", englishName: "Malay" },
  { code: "ja", label: "日本語", englishName: "Japanese" },
  { code: "ko", label: "한국어", englishName: "Korean" },
  { code: "es", label: "Español", englishName: "Spanish" },
  { code: "fr", label: "Français", englishName: "French" },
  { code: "de", label: "Deutsch", englishName: "German" },
  { code: "pt-BR", label: "Português (Brasil)", englishName: "Portuguese (Brazil)" },
  { code: "th", label: "ไทย", englishName: "Thai" },
  { code: "vi", label: "Tiếng Việt", englishName: "Vietnamese" },
  { code: "hi", label: "हिन्दी", englishName: "Hindi" },
  { code: "ar", label: "العربية", englishName: "Arabic" },
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
    case "zh-TW":
      return "zh-TW";
    case "pt-BR":
      return "pt-BR";
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
