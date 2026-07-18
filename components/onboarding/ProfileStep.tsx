"use client";

import { useEffect, useState } from "react";
import { getTimezoneOptions, type TimezoneOption } from "@/lib/timezones";
import TimezoneCombobox from "./TimezoneCombobox";

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
        <h2 className="text-2xl font-extrabold nb-heading sm:text-3xl" style={{ color: "var(--sb-ink)" }}>
          Let&apos;s build your profile
        </h2>
        <p className="mt-3" style={{ color: "var(--sb-muted)" }}>
          Tell the community a little about yourself.
          <br className="hidden sm:block" /> You can always edit this later.
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="bio" className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
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
            className="nb-input w-full resize-none px-4 py-3.5 text-sm"
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-xs" style={{ color: "var(--sb-muted)" }}>
            {bio.length}/{maxLength}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="timezone" className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
          Timezone
        </label>
        <div className="mt-2">
          <TimezoneCombobox value={timezone} options={timezones} onChange={onTimezoneChange} />
        </div>
      </div>
    </div>
  );
}