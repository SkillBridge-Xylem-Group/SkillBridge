"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { normalizeUsernameInput } from "@/lib/username";

type UsernameFieldProps = {
  value: string;
  onChange: (value: string) => void;
  currentUsername?: string;
  disabled?: boolean;
  onReadyChange?: (ready: boolean) => void;
};

export default function UsernameField({
  value,
  onChange,
  currentUsername = "",
  disabled = false,
  onReadyChange,
}: UsernameFieldProps) {
  const { dictionary } = useLocale();
  const p = dictionary.profile;
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "invalid">("idle");
  const [reason, setReason] = useState("");

  const normalizedCurrent = normalizeUsernameInput(currentUsername);
  const normalizedValue = normalizeUsernameInput(value);
  const usernameChanged = normalizedValue !== normalizedCurrent;

  function message(code: string) {
    switch (code) {
      case "TOO_SHORT":
        return p.usernameTooShort;
      case "TOO_LONG":
        return p.usernameTooLong;
      case "MUST_START_WITH_LETTER":
        return p.usernameMustStartWithLetter;
      case "INVALID_CHARS":
        return p.usernameInvalidChars;
      case "RESERVED":
        return p.usernameReserved;
      case "TAKEN":
        return p.usernameTaken;
      default:
        return p.usernameInvalidChars;
    }
  }

  useEffect(() => {
    if (!normalizedValue) {
      setStatus("invalid");
      setReason("TOO_SHORT");
      return;
    }
    if (!usernameChanged) {
      setStatus("idle");
      setReason("");
      return;
    }

    setStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/username?username=${encodeURIComponent(normalizedValue)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          setReason("INVALID_CHARS");
          return;
        }
        if (!data.available) {
          setStatus(data.reason ? "invalid" : "unavailable");
          setReason(data.reason ?? "TAKEN");
          return;
        }
        setStatus("available");
        setReason("");
      } catch {
        setStatus("invalid");
        setReason("INVALID_CHARS");
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [normalizedValue, usernameChanged]);

  const isReady = normalizedValue.length > 0 && (!usernameChanged || status === "available");

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  return (
    <div>
      <label className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
        {p.usernameLabel}
      </label>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
          @
        </span>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(normalizeUsernameInput(e.target.value))}
          placeholder={p.usernamePlaceholder}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={30}
          className="nb-input min-w-0 flex-1 px-3 py-2 text-sm disabled:opacity-60"
        />
      </div>
      <p className="mt-1 text-xs" style={{ color: "var(--sb-muted)" }}>
        {p.usernameHint}
      </p>
      {status === "checking" ? (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--sb-muted)" }}>
          {p.usernameChecking}
        </p>
      ) : null}
      {status === "available" ? (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--sb-teal-dark)" }}>
          {p.usernameAvailable}
        </p>
      ) : null}
      {status === "unavailable" || status === "invalid" ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{message(reason)}</p>
      ) : null}
    </div>
  );
}
