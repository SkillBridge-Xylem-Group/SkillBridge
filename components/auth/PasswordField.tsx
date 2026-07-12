"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function PasswordField({
  id,
  label,
  placeholder = "Enter your password",
  value,
  onChange,
  autoComplete = "current-password",
  onFocus,
  onBlur,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brand-blue)";
            onFocus?.();
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-fog)";
            onBlur?.();
          }}
          className="w-full border px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none"
          style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-mid-gray)" }}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
