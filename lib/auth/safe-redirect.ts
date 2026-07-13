const DEFAULT_REDIRECT = "/dashboard";

/** Allow only same-origin relative paths under /dashboard to prevent open redirects. */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback = DEFAULT_REDIRECT
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  const pathname = path.split("?")[0].split("#")[0];
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return path;
  }

  return fallback;
}
