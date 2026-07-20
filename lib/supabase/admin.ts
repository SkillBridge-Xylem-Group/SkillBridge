import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged server-only client (bypasses RLS).
 * Used for writing notifications to other users, awarding XP / trust scores, etc.
 * Never import this from client components.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for privileged server operations. Add it to the server environment (never NEXT_PUBLIC_)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export function tryCreateSupabaseAdminClient(): SupabaseClient | null {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    return createSupabaseAdminClient();
  } catch {
    return null;
  }
}
