import type { NextRequest } from "next/server";

/**
 * Derives the public-facing origin (protocol + host) from forwarded proxy
 * headers instead of `request.url`. Behind the nginx reverse proxy, Next.js
 * resolves `request.url`'s origin from the raw internal connection (e.g.
 * http://localhost:4001) rather than the external domain, since nginx isn't
 * configured to send X-Forwarded-Proto. Reading the Host header directly
 * (which nginx does forward correctly via proxy_set_header Host $host) avoids
 * that and always lands on the domain the user actually visited.
 */
export function getRequestOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
