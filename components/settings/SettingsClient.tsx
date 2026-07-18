"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { signOutEverywhere } from "@/lib/auth/sign-out";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { isPasswordValid } from "@/lib/auth/password";
import { COUNTRY_OPTIONS, countryName } from "@/lib/settingsOptions";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LOCALE_OPTIONS, localeLabel, type AppLocale } from "@/lib/i18n/locales";

type SettingsTab = "account" | "security";
type Gender = "man" | "woman" | "non_binary" | "prefer_not_to_say";
/** approximate | none | ISO country code */
type LocationPreference = string;
type ModalKind = "email" | "gender" | "location" | "language" | null;

type SettingsClientProps = {
  email: string;
  hasEmailPassword: boolean;
  gender: Gender | null;
  locationPreference: LocationPreference | null;
  language: AppLocale | null;
};

function SettingRow({
  label,
  description,
  onClick,
  children,
}: {
  label: string;
  description?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    "group flex w-full min-h-[52px] items-center justify-between gap-8 rounded-xl py-3.5 text-left transition";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} px-1 hover:bg-brand-light/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-5 text-slate-900">{label}</p>
          {description ? <p className="mt-1 text-[13px] leading-4 text-slate-500">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </button>
    );
  }

  return (
    <div className={`${className} px-1`}>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-5 text-slate-900">{label}</p>
        {description ? <p className="mt-1 text-[13px] leading-4 text-slate-500">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-8 first:pt-6">
      <h2 className="mb-1 px-1 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function SettingsModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[min(36rem,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-brand-light hover:text-brand"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer ? <div className="border-t border-slate-100 px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export default function SettingsClient({
  email: initialEmail,
  hasEmailPassword,
  gender: initialGender,
  locationPreference: initialLocation,
  language: initialLanguage,
}: SettingsClientProps) {
  const { locale, dictionary, setLocale } = useLocale();
  const s = dictionary.settings;

  const [tab, setTab] = useState<SettingsTab>("account");
  const [modal, setModal] = useState<ModalKind>(null);

  const [email] = useState(initialEmail);
  const [gender, setGender] = useState<Gender | null>(initialGender);
  const [locationPreference, setLocationPreference] = useState<LocationPreference | null>(initialLocation);

  const [draftGender, setDraftGender] = useState<Gender>("prefer_not_to_say");
  const [draftLocation, setDraftLocation] = useState<LocationPreference>("approximate");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftLanguage, setDraftLanguage] = useState<AppLocale>("en");

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "account", label: s.account },
    { id: "security", label: s.security },
  ];

  const genderOptions: { value: Gender; label: string }[] = [
    { value: "man", label: s.genderMan },
    { value: "woman", label: s.genderWoman },
    { value: "non_binary", label: s.genderNonBinary },
    { value: "prefer_not_to_say", label: s.genderPreferNot },
  ];

  function genderLabel(value: Gender | null): string {
    return genderOptions.find((o) => o.value === value)?.label ?? s.genderPreferNot;
  }

  function locationLabel(value: LocationPreference | null): string {
    if (!value || value === "approximate") return s.locationApproximate;
    if (value === "none") return s.locationNone;
    return countryName(value) ?? value;
  }

  function openModal(kind: ModalKind) {
    setModalError("");
    setModalMessage("");
    if (kind === "gender") setDraftGender(gender ?? "prefer_not_to_say");
    if (kind === "location") setDraftLocation(locationPreference ?? "approximate");
    if (kind === "email") setDraftEmail(email);
    if (kind === "language") setDraftLanguage(locale ?? initialLanguage ?? "en");
    setModal(kind);
  }

  async function saveAccountSettings(payload: {
    gender?: Gender;
    location_preference?: string;
    language?: AppLocale;
  }) {
    setSaving(true);
    setModalError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setModalError(data?.error ?? "Failed to save settings.");
        return false;
      }
      return true;
    } catch {
      setModalError("Failed to save settings.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveGender() {
    const ok = await saveAccountSettings({ gender: draftGender });
    if (!ok) return;
    setGender(draftGender);
    setModal(null);
  }

  async function saveLocation() {
    const ok = await saveAccountSettings({ location_preference: draftLocation });
    if (!ok) return;
    setLocationPreference(draftLocation);
    setModal(null);
  }

  async function saveLanguage() {
    const ok = await saveAccountSettings({ language: draftLanguage });
    if (!ok) return;
    setLocale(draftLanguage);
    setModal(null);
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setModalError("");
    setModalMessage("");
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draftEmail.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setModalError(data?.error ?? "Failed to update email.");
        return;
      }
      setModalMessage(data?.message ?? "Check your inbox to confirm the new email address.");
    } catch {
      setModalError("Failed to update email.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage("");
    setPasswordError("");

    if (!isPasswordValid(password)) {
      setPasswordError("New password does not meet the requirements.");
      setPasswordSaving(false);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password, confirmPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setPasswordError(data?.error ?? "Failed to update password.");
        return;
      }
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setPasswordFocus(false);
      setPasswordOpen(false);
    } catch {
      setPasswordError("Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOutEverywhere();
    } finally {
      window.location.replace("/login?loggedOut=1");
    }
  }

  const inputClass =
    "w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none";

  const outlineBtn =
    "btn-pill border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand/40 hover:bg-brand-light hover:text-brand disabled:opacity-60";

  const doneBtn =
    "btn-pill w-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col">
      <h1 className="text-[28px] font-bold leading-none tracking-tight text-slate-900">{s.title}</h1>

      <nav className="mt-5 w-full border-b border-slate-100" aria-label="Settings sections">
        <div className="flex gap-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative shrink-0 pb-3 text-sm font-semibold transition ${
                  active ? "text-brand" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" /> : null}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="w-full">
        {tab === "account" ? (
          <div>
            <Section title={s.general}>
              <SettingRow label={s.emailAddress} onClick={() => openModal("email")}>
                <span className="max-w-[24rem] truncate text-sm text-slate-500">{email || "—"}</span>
                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:text-brand"
                  strokeWidth={1.75}
                />
              </SettingRow>

              <SettingRow label={s.gender} onClick={() => openModal("gender")}>
                <span className="text-sm text-slate-500">{genderLabel(gender)}</span>
                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:text-brand"
                  strokeWidth={1.75}
                />
              </SettingRow>

              <SettingRow label={s.locationCustomization} onClick={() => openModal("location")}>
                <span className="max-w-[20rem] truncate text-sm text-slate-500 sm:max-w-[28rem]">
                  {locationLabel(locationPreference)}
                </span>
                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:text-brand"
                  strokeWidth={1.75}
                />
              </SettingRow>

              <SettingRow label={s.language} onClick={() => openModal("language")}>
                <span className="text-sm text-slate-500">{localeLabel(locale ?? initialLanguage)}</span>
                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:text-brand"
                  strokeWidth={1.75}
                />
              </SettingRow>
            </Section>

            <Section title={s.session}>
              <SettingRow label={s.logOut} description={s.logOutDesc}>
                <button type="button" onClick={handleLogout} disabled={isLoggingOut} className={outlineBtn}>
                  {isLoggingOut ? dictionary.menu.loggingOut : s.logOut}
                </button>
              </SettingRow>
            </Section>
          </div>
        ) : null}

        {tab === "security" ? (
          <div>
            <Section title={s.password}>
              {hasEmailPassword ? (
                <>
                  <SettingRow label={s.password} description={s.passwordDesc}>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordOpen((o) => !o);
                        setPasswordError("");
                        setPasswordMessage("");
                      }}
                      className={outlineBtn}
                    >
                      {passwordOpen ? s.cancel : s.change}
                    </button>
                  </SettingRow>

                  {passwordOpen ? (
                    <form onSubmit={changePassword} className="mt-2 max-w-xl space-y-4 py-2">
                      <div>
                        <label htmlFor="settings-current-password" className="text-sm font-medium text-slate-700">
                          {s.currentPassword}
                        </label>
                        <input
                          id="settings-current-password"
                          type="password"
                          autoComplete="current-password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className={`mt-1.5 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-new-password" className="text-sm font-medium text-slate-700">
                          {s.newPassword}
                        </label>
                        <input
                          id="settings-new-password"
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setPasswordFocus(true)}
                          onBlur={() => setPasswordFocus(false)}
                          required
                          className={`mt-1.5 ${inputClass}`}
                        />
                        <PasswordRequirements password={password} open={passwordFocus || !!password} />
                      </div>
                      <div>
                        <label htmlFor="settings-confirm-password" className="text-sm font-medium text-slate-700">
                          {s.confirmPassword}
                        </label>
                        <input
                          id="settings-confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className={`mt-1.5 ${inputClass}`}
                        />
                      </div>

                      {passwordError ? <p className="text-sm font-medium text-red-600">{passwordError}</p> : null}
                      {passwordMessage ? (
                        <p className="text-sm font-medium text-emerald-600">{passwordMessage}</p>
                      ) : null}

                      <button type="submit" disabled={passwordSaving} className={`${doneBtn} w-auto px-6`}>
                        {passwordSaving ? s.updating : s.updatePassword}
                      </button>
                    </form>
                  ) : null}
                </>
              ) : (
                <SettingRow label={s.password} description={s.passwordGoogle}>
                  <span className="text-sm text-slate-500">Google</span>
                  <ChevronRight size={18} className="text-slate-400" strokeWidth={1.75} />
                </SettingRow>
              )}
            </Section>
          </div>
        ) : null}
      </div>

      {modal === "email" ? (
        <SettingsModal title={s.emailAddress} onClose={() => setModal(null)}>
          <form onSubmit={saveEmail} className="space-y-4">
            <p className="text-sm text-slate-500">{s.emailChangeHint}</p>
            <div>
              <label htmlFor="settings-new-email" className="text-sm font-medium text-slate-700">
                {s.emailAddress}
              </label>
              <input
                id="settings-new-email"
                type="email"
                autoComplete="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                required
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            {modalError ? <p className="text-sm font-medium text-red-600">{modalError}</p> : null}
            {modalMessage ? <p className="text-sm font-medium text-emerald-600">{modalMessage}</p> : null}
            <button type="submit" disabled={saving} className={doneBtn}>
              {saving ? s.saving : s.save}
            </button>
          </form>
        </SettingsModal>
      ) : null}

      {modal === "gender" ? (
        <SettingsModal
          title={s.gender}
          onClose={() => setModal(null)}
          footer={
            <button type="button" disabled={saving} onClick={saveGender} className={doneBtn}>
              {saving ? s.saving : s.done}
            </button>
          }
        >
          <div>
            {genderOptions.map((option) => {
              const selected = draftGender === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraftGender(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-3.5 text-left transition ${
                    selected ? "bg-brand-light text-brand" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-sm font-medium ${selected ? "text-brand" : "text-slate-900"}`}>
                    {option.label}
                  </span>
                  {selected ? <Check size={18} className="text-brand" strokeWidth={2.5} /> : null}
                </button>
              );
            })}
          </div>
          {modalError ? <p className="mt-2 text-sm font-medium text-red-600">{modalError}</p> : null}
        </SettingsModal>
      ) : null}

      {modal === "location" ? (
        <SettingsModal
          title={s.locationCustomization}
          onClose={() => setModal(null)}
          footer={
            <button type="button" disabled={saving} onClick={saveLocation} className={doneBtn}>
              {saving ? s.saving : s.done}
            </button>
          }
        >
          <p className="mb-3 text-sm text-slate-500">{s.locationHint}</p>
          <label htmlFor="settings-location" className="text-sm font-medium text-slate-700">
            {s.locationCustomization}
          </label>
          <select
            id="settings-location"
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            className={`mt-1.5 appearance-none ${inputClass}`}
          >
            <option value="approximate">{s.locationApproximate}</option>
            <option value="none">{s.locationNone}</option>
            <optgroup label={s.locationCountry}>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </optgroup>
          </select>
          {modalError ? <p className="mt-3 text-sm font-medium text-red-600">{modalError}</p> : null}
        </SettingsModal>
      ) : null}

      {modal === "language" ? (
        <SettingsModal
          title={s.language}
          onClose={() => setModal(null)}
          footer={
            <button type="button" disabled={saving} onClick={saveLanguage} className={doneBtn}>
              {saving ? s.saving : s.done}
            </button>
          }
        >
          <div>
            {LOCALE_OPTIONS.map((option) => {
              const selected = draftLanguage === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setDraftLanguage(option.code)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-3.5 text-left transition ${
                    selected ? "bg-brand-light text-brand" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-sm font-medium ${selected ? "text-brand" : "text-slate-900"}`}>
                    {option.label}
                  </span>
                  {selected ? <Check size={18} className="text-brand" strokeWidth={2.5} /> : null}
                </button>
              );
            })}
          </div>
          {modalError ? <p className="mt-2 text-sm font-medium text-red-600">{modalError}</p> : null}
        </SettingsModal>
      ) : null}
    </div>
  );
}
