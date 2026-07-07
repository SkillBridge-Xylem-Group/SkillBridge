"use client";

import { useMemo } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { getTimezoneOptions } from "@/lib/timezones";

type ProfileStepProps = {
  bio: string;
  onBioChange: (value: string) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
};

export default function ProfileStep({ bio, onBioChange, timezone, onTimezoneChange }: ProfileStepProps) {
  const maxLength = 300;
  const timezones = useMemo(() => getTimezoneOptions(), []);

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Let&apos;s build your profile</h2>
        <p className="mt-3 text-slate-500">
          Tell the community a little about yourself.
          <br className="hidden sm:block" /> You can always edit this later.
        </p>
      </div>

      <div className="mt-8">
        <label htmlFor="bio" className="text-sm font-bold text-slate-900">
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
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-slate-400">
            {bio.length}/{maxLength}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="timezone" className="text-sm font-bold text-slate-900">
          Timezone
        </label>
        <div className="relative mt-2">
          <Globe size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}