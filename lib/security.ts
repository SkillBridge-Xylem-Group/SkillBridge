import { createHmac, timingSafeEqual } from "crypto";

const RECOVERY_COOKIE = "sb-pw-recovery";
const CHANNEL_TTL_MS = 2 * 60 * 60 * 1000; // 2h

function secret(): string {
  const swapSecret = process.env.SWAP_CHANNEL_SECRET?.trim();
  if (swapSecret) return swapSecret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SWAP_CHANNEL_SECRET is required in production. Use a dedicated random string — do not reuse SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const devFallback =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "dev-insecure-secret";
  return devFallback;
}

export function recoveryCookieName() {
  return RECOVERY_COOKIE;
}

export function signRecoveryToken(userId: string, expiresAt: number): string {
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyRecoveryToken(token: string | undefined, userId: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [uid, expStr, sig] = parts;
  if (uid !== userId) return false;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = createHmac("sha256", secret()).update(`${uid}.${expStr}`).digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Shared channel topic for both session participants (requires server-issued token). */
export function signSwapChannelToken(requestId: string, expiresAt: number): string {
  const payload = `${requestId}.${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(`swap:${payload}`).digest("base64url");
  return `${expiresAt}.${sig}`;
}

export function verifySwapChannelToken(requestId: string, token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expStr, sig] = parts;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = createHmac("sha256", secret())
    .update(`swap:${requestId}.${expStr}`)
    .digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Shared Realtime topic for both session participants (obfuscated, not guessable from request id alone). */
export function swapChannelName(requestId: string): string {
  const digest = createHmac("sha256", secret())
    .update(`swap-channel:${requestId}`)
    .digest("hex")
    .slice(0, 24);
  return `swap-session:${requestId}:${digest}`;
}

export function swapChannelTtlMs() {
  return CHANNEL_TTL_MS;
}

/** Escape PostgREST `.or()` / `.ilike` filter metacharacters. */
export function escapePostgrestFilter(raw: string): string {
  return raw.replace(/[,()%\\]/g, "");
}

export function isAllowedAvatarUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (supabaseUrl) {
    const prefix = `${supabaseUrl}/storage/v1/object/public/avatars/`;
    if (trimmed.startsWith(prefix)) return true;
  }
  return /^https:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\/avatars\//i.test(trimmed);
}
