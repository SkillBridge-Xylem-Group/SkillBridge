import type { SupabaseClient } from "@supabase/supabase-js";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export type UsernameFormatError =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_CHARS"
  | "MUST_START_WITH_LETTER"
  | "RESERVED";

const USERNAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "browse",
  "communities",
  "dashboard",
  "forum",
  "home",
  "login",
  "messages",
  "onboarding",
  "profile",
  "settings",
  "signup",
  "swap-requests",
  "swap-session",
  "user",
  "users",
  "www",
]);

export function normalizeUsernameInput(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsernameFormat(username: string): { ok: true; username: string } | { error: UsernameFormatError } {
  const normalized = normalizeUsernameInput(username);
  if (normalized.length < USERNAME_MIN_LENGTH) return { error: "TOO_SHORT" };
  if (normalized.length > USERNAME_MAX_LENGTH) return { error: "TOO_LONG" };
  if (!/^[a-z]/.test(normalized)) return { error: "MUST_START_WITH_LETTER" };
  if (!USERNAME_PATTERN.test(normalized)) return { error: "INVALID_CHARS" };
  if (RESERVED_USERNAMES.has(normalized)) return { error: "RESERVED" };
  return { ok: true, username: normalized };
}

export async function isUsernameAvailable(
  supabase: SupabaseClient,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const validated = validateUsernameFormat(username);
  if (!("ok" in validated)) return false;

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("slug", validated.username)
    .maybeSingle();

  if (!data) return true;
  if (excludeUserId && data.id === excludeUserId) return true;
  return false;
}
