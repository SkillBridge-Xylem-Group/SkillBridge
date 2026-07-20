import type { NextRequest } from "next/server";

function normalizeOrigin(raw: string): string {
  return raw.replace(/\/$/, "");
}

function allowedOrigins(): string[] {
  const configured = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]
    .filter(Boolean)
    .map((v) => normalizeOrigin(v as string));

  const extras = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  const list = [...configured, ...extras];
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  return [...new Set(list)];
}

/**
 * Public site origin for auth redirect links.
 * Prefer NEXT_PUBLIC_SITE_URL. Only falls back to request Host when that host
 * is explicitly allowlisted (prevents Host / X-Forwarded-Host reset poisoning).
 */
export function getRequestOrigin(request: Request | NextRequest): string {
  const allow = allowedOrigins();
  const primary = allow[0];

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    const candidate = normalizeOrigin(`${protocol}://${host}`);
    if (allow.includes(candidate)) return candidate;
  }

  if (primary) return primary;
  return "http://localhost:3000";
}
