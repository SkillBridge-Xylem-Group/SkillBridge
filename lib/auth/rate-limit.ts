import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

type Entry = { count: number; first: number };

const stores = new Map<string, Map<string, Entry>>();

function getStore(namespace: string): Map<string, Entry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

/** Prefer headers set by the reverse proxy; harder to spoof than x-forwarded-for alone. */
export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}

export function getClientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

function memoryRateLimit(
  namespace: string,
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const store = getStore(namespace);
  let entry = store.get(key) ?? { count: 0, first: now };

  if (now - entry.first > windowMs) {
    entry = { count: 0, first: now };
  }

  entry.count++;
  store.set(key, entry);

  if (entry.count > maxAttempts) {
    const retryAfterMs = windowMs - (now - entry.first);
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}

/**
 * Sync rate limit (in-memory). Prefer `checkRateLimitAsync` on auth endpoints
 * when SUPABASE_SERVICE_ROLE_KEY is configured so limits share across instances.
 */
export function checkRateLimit(
  namespace: string,
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  return memoryRateLimit(namespace, key, maxAttempts, windowMs);
}

/** Cross-instance rate limit via auth_rate_limits table (service role). */
export async function checkRateLimitAsync(
  namespace: string,
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const admin = tryCreateSupabaseAdminClient();
  if (!admin) {
    return memoryRateLimit(namespace, key, maxAttempts, windowMs);
  }

  const now = Date.now();
  const bucket = namespace;
  const rateKey = key.slice(0, 200);

  const { data: row } = await admin
    .from("auth_rate_limits")
    .select("window_started_at, hit_count")
    .eq("bucket", bucket)
    .eq("rate_key", rateKey)
    .maybeSingle();

  let windowStarted = row?.window_started_at ? new Date(row.window_started_at).getTime() : now;
  let hitCount = row?.hit_count ?? 0;

  if (now - windowStarted > windowMs) {
    windowStarted = now;
    hitCount = 0;
  }

  hitCount += 1;

  await admin.from("auth_rate_limits").upsert({
    bucket,
    rate_key: rateKey,
    window_started_at: new Date(windowStarted).toISOString(),
    hit_count: hitCount,
  });

  if (hitCount > maxAttempts) {
    return { allowed: false, retryAfterMs: Math.max(windowMs - (now - windowStarted), 0) };
  }

  return { allowed: true, remaining: maxAttempts - hitCount };
}

export function rateLimitHeaders(retryAfterMs: number): HeadersInit {
  return { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) };
}
