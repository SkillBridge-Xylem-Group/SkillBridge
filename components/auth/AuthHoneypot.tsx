"use client";

type AuthHoneypotProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Hidden field — bots often fill it; real users never see it. */
export default function AuthHoneypot({ value, onChange }: AuthHoneypotProps) {
  return (
    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="website">Website</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
