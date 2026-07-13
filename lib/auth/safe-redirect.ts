const DEFAULT_REDIRECT = "/dashboard";

/** Allow only same-origin relative paths on known app routes. */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback = DEFAULT_REDIRECT
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  const pathname = path.split("?")[0].split("#")[0];
  if (
    pathname === "/dashboard" ||
    pathname === "/reset-password" ||
    pathname === "/login" ||
    pathname.startsWith("/dashboard/")
  ) {
    return path;
  }

  return fallback;
}
