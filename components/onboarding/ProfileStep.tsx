"use client";

import { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { getTimezoneOptions, type TimezoneOption } from "@/lib/timezones";

type ProfileStepProps = {
  bio: string;
  onBioChange: (value: string) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
};

const INITIAL_TIMEZONES: TimezoneOption[] = [{ value: "Asia/Jakarta", label: "(GMT+07:00) Jakarta" }];

export default function ProfileStep({ bio, onBioChange, timezone, onTimezoneChange }: ProfileStepProps) {
  const maxLength = 300;
  const [timezones, setTimezones] = useState<TimezoneOption[]>(INITIAL_TIMEZONES);

  useEffect(() => {
    setTimezones(getTimezoneOptions());
  }, []);

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-medium sm:text-3xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
          Let&apos;s build your profile
        </h2>
        <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>
          Tell the community a little about yourself.
          <br className="hidden sm:block" /> You can always edit this later.
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="bio" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
          Short Bio
        </label>
        <div className="relative mt-2">
          <textarea
            id="bio"
            rows={5}
            maxLength={maxLength}
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Share a bit about yourself, your background, and what you enjoy..."
            className="w-full resize-none border px-4 py-3.5 text-sm placeholder:text-slate-400 focus:outline-none"
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-blue)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-xs" style={{ color: "var(--color-mid-gray)" }}>
            {bio.length}/{maxLength}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="timezone" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
          Timezone
        </label>
        <div className="relative mt-2">
          <Globe size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-mid-gray)" }} />
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full appearance-none border bg-white py-3.5 pl-11 pr-11 text-sm focus:outline-none"
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-mid-gray)" }} />
        </div>
      </div>
    </div>
  );
}