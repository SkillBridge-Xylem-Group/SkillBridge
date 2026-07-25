const REQUIRED_IN_PRODUCTION = ["SUPABASE_SERVICE_ROLE_KEY", "SWAP_CHANNEL_SECRET"] as const;

/**
 * Fail fast when production is missing secrets that power notifications,
 * XP, cross-instance rate limits, and signed swap channels.
 */
export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return;

  throw new Error(
    `Missing required production environment variables: ${missing.join(", ")}. ` +
      "Set SUPABASE_SERVICE_ROLE_KEY (server-only) and SWAP_CHANNEL_SECRET (long random string, not the service role key)."
  );
}
