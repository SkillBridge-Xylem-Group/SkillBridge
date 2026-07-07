export type TimezoneOption = {
  value: string;
  label: string;
};

function getOffsetLabel(timeZone: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(date);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
    return raw === "GMT" ? "GMT+00:00" : raw;
  } catch {
    return "GMT+00:00";
  }
}

function parseOffsetMinutes(offset: string): number {
  const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
}

function formatCityName(timeZone: string): string {
  const parts = timeZone.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

/**
 * Returns every IANA timezone the runtime knows about, labeled with its
 * real current GMT offset (e.g. "(GMT+07:00) Jakarta"), sorted by offset.
 */
export function getTimezoneOptions(): TimezoneOption[] {
  const now = new Date();
  let zoneNames: string[];

  try {
    zoneNames = Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for runtimes without Intl.supportedValuesOf
    zoneNames = [
      "UTC",
      "Asia/Jakarta",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
    ];
  }

  return zoneNames
    .map((zone) => {
      const offset = getOffsetLabel(zone, now);
      return {
        value: zone,
        label: `(${offset}) ${formatCityName(zone)}`,
        offsetMinutes: parseOffsetMinutes(offset),
      };
    })
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.value.localeCompare(b.value))
    .map(({ value, label }) => ({ value, label }));
}

/** Best-effort guess of the visitor's own timezone, for a sensible default. */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Jakarta";
  }
}