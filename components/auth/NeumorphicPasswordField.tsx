"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, type LucideIcon } from "lucide-react";

type NeumorphicPasswordFieldProps = {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  iconColor?: string;
  icon?: LucideIcon;
};

/** Password input for the neumorphic sliding auth card — kept separate from
 * PasswordField.tsx so the untouched /reset-password flow isn't affected. */
export default function NeumorphicPasswordField({
  id,
  placeholder = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  maxLength,
  onFocus,
  onBlur,
  iconColor,
  icon: Icon = Lock,
}: NeumorphicPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Icon size={18} className="auth-neu-icon" style={iconColor ? { color: iconColor } : undefined} />
      <input
        id={id}
        name={id}
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="auth-neu-input pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2"
        style={{ color: "var(--neu-text-muted)" }}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
