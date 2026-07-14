const DEFAULT_REDIRECT = "/dashboard";

const ALLOWED_EXACT = new Set(["/dashboard", "/reset-password", "/login"]);

/** Allow only same-origin relative paths on known auth/app routes. */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback = DEFAULT_REDIRECT
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  const pathname = path.split("?")[0].split("#")[0];
  if (ALLOWED_EXACT.has(pathname) || pathname.startsWith("/dashboard/")) {
    return path;
  }

  return fallback;
}
