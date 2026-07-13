export const PASSWORD_MAX_LENGTH = 128;

export const passwordSpecialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function getPasswordCheckState(password: string) {
  return {
    minLength: password.length >= 8,
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
    checks.hasLowercase &&
    checks.hasUppercase &&
    checks.hasNumber &&
    checks.hasSpecial
  );
}

// Check whether the password appears in known breaches using HIBP k-Anonymity
export async function isPwnedPassword(password: string): Promise<boolean> {
  try {
    const crypto = await import("crypto");
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) return false; // if API fails, don't block registration

    const text = await res.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix] = line.split(":");
      if (hashSuffix === suffix) return true;
    }
    return false;
  } catch {
    // don't fail open on any unexpected error
    return false;
  }
}
