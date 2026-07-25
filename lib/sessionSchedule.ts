export const SCHEDULE_PAST_ERROR = "SCHEDULE_MUST_BE_FUTURE" as const;
export const SCHEDULE_TOO_FAR_ERROR = "SCHEDULE_TOO_FAR" as const;
export const SCHEDULE_INVALID_ERROR = "SCHEDULE_INVALID" as const;

export const MAX_SCHEDULE_LEAD_WEEKS = 4;

export function parseScheduledTime(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function truncateToMinute(date: Date): Date {
  const truncated = new Date(date);
  truncated.setSeconds(0, 0);
  return truncated;
}

function maxScheduleDate(now = new Date()): Date {
  const max = truncateToMinute(now);
  max.setDate(max.getDate() + MAX_SCHEDULE_LEAD_WEEKS * 7);
  return max;
}

function formatDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** True when the scheduled time is the current minute or later (hour + minute only). */
export function isFutureScheduledTime(value: string | Date, now = new Date()): boolean {
  const date = typeof value === "string" ? parseScheduledTime(value) : value;
  if (!date) return false;
  return truncateToMinute(date).getTime() >= truncateToMinute(now).getTime();
}

export function isScheduledTimeTooFar(value: string | Date, now = new Date()): boolean {
  const date = typeof value === "string" ? parseScheduledTime(value) : value;
  if (!date) return false;
  return truncateToMinute(date).getTime() > maxScheduleDate(now).getTime();
}

export function isAllowedScheduledTime(value: string | Date, now = new Date()): boolean {
  return isFutureScheduledTime(value, now) && !isScheduledTimeTooFar(value, now);
}

export function validateFutureScheduledTime(
  value: string,
  now = new Date()
):
  | { ok: true; iso: string }
  | {
      error:
        | typeof SCHEDULE_PAST_ERROR
        | typeof SCHEDULE_TOO_FAR_ERROR
        | typeof SCHEDULE_INVALID_ERROR;
    } {
  const date = parseScheduledTime(value);
  if (!date) return { error: SCHEDULE_INVALID_ERROR };
  if (!isFutureScheduledTime(date, now)) return { error: SCHEDULE_PAST_ERROR };
  if (isScheduledTimeTooFar(date, now)) return { error: SCHEDULE_TOO_FAR_ERROR };
  return { ok: true, iso: date.toISOString() };
}

/** `datetime-local` minimum in the user's local timezone (hour and minute). */
export function datetimeLocalMinValue(now = new Date()): string {
  return formatDatetimeLocalValue(truncateToMinute(now));
}

/** `datetime-local` maximum, four weeks from now (hour and minute). */
export function datetimeLocalMaxValue(now = new Date()): string {
  return formatDatetimeLocalValue(maxScheduleDate(now));
}
