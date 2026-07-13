"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordCheckState, isPasswordValid } from "@/lib/auth/password";

type PasswordRequirementsProps = {
  password: string;
  open: boolean;
};

type RequirementKey = keyof ReturnType<typeof getPasswordCheckState>;

const requirements: Array<{ key: RequirementKey; label: string }> = [
  { key: "minLength", label: "At least 8 characters" },
  { key: "maxLength", label: "At most 128 characters" },
  { key: "hasLowercase", label: "Lowercase letter (a-z)" },
  { key: "hasUppercase", label: "Uppercase letter (A-Z)" },
  { key: "hasNumber", label: "Number (0-9)" },
  { key: "hasSpecial", label: "Special character (!@#$%^&*)" },
];

export default function PasswordRequirements({ password, open }: PasswordRequirementsProps) {
  const checks = getPasswordCheckState(password);
  const valid = isPasswordValid(password);

  if (!password && !open) return null;
  if (valid && !open) return null;

  return (
    <div
      className="mt-2 overflow-hidden transition-all duration-500 ease-out"
      style={{ maxHeight: open ? 500 : 0, opacity: open ? 1 : 0 }}
    >
      <ul
        className="space-y-2 pt-2 text-sm"
        style={{
          color: "var(--color-carbon)",
          transform: open ? "translateY(0)" : "translateY(-10px)",
          transition: "transform 300ms ease-out",
        }}
      >
        {requirements.map((req) => {
          const passed = checks[req.key];
          return (
            <li key={req.key} className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-brand-green)" }} />
              ) : (
                <Circle className="h-4 w-4" style={{ color: "var(--color-mid-gray)" }} />
              )}
              <span style={{ color: passed ? "var(--color-carbon)" : "var(--color-mid-gray)" }}>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
