export const PASSWORD_MAX_LENGTH = 128;

export const passwordSpecialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function getPasswordCheckState(password: string) {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= PASSWORD_MAX_LENGTH,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: passwordSpecialCharRegex.test(password),
  };
}

export function isPasswordValid(password: string) {
  const checks = getPasswordCheckState(password);

  return (
    checks.minLength &&
    checks.maxLength &&
    checks.hasLowercase &&
    checks.hasUppercase &&
    checks.hasNumber &&
    checks.hasSpecial
  );
}

export type BreachCheckResult = "clean" | "pwned" | "unavailable";

// Check whether the password appears in known breaches using HIBP k-Anonymity
export async function checkPasswordBreached(password: string): Promise<BreachCheckResult> {
  try {
    const crypto = await import("crypto");
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return "unavailable";

    const text = await res.text();
    for (const line of text.split("\n")) {
      const [hashSuffix] = line.split(":");
      if (hashSuffix === suffix) return "pwned";
    }
    return "clean";
  } catch {
    return "unavailable";
  }
}

/** @deprecated Use checkPasswordBreached for explicit unavailable handling */
export async function isPwnedPassword(password: string): Promise<boolean> {
  const result = await checkPasswordBreached(password);
  return result === "pwned";
}
