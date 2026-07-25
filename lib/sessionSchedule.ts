export const SCHEDULE_PAST_ERROR = "SCHEDULE_MUST_BE_FUTURE" as const;
export const SCHEDULE_INVALID_ERROR = "SCHEDULE_INVALID" as const;

export function parseScheduledTime(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isFutureScheduledTime(value: string | Date, now = new Date()): boolean {
  const date = typeof value === "string" ? parseScheduledTime(value) : value;
  if (!date) return false;
  return date.getTime() > now.getTime();
}

export function validateFutureScheduledTime(
  value: string,
  now = new Date()
):
  | { ok: true; iso: string }
  | { error: typeof SCHEDULE_PAST_ERROR | typeof SCHEDULE_INVALID_ERROR } {
  const date = parseScheduledTime(value);
  if (!date) return { error: SCHEDULE_INVALID_ERROR };
  if (!isFutureScheduledTime(date, now)) return { error: SCHEDULE_PAST_ERROR };
  return { ok: true, iso: date.toISOString() };
}

/** `datetime-local` input minimum in the user's local timezone. */
export function datetimeLocalMinValue(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
