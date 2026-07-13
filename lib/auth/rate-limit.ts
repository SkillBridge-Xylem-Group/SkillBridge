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
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export function checkRateLimit(
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

export function rateLimitHeaders(retryAfterMs: number): HeadersInit {
  return { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) };
}
