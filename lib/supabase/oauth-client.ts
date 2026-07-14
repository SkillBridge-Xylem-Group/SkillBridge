import { createClient } from "@supabase/supabase-js";

/**
 * Dedicated browser client for Google OAuth PKCE.
 * @supabase/ssr stores the PKCE code verifier in cookies; after redirecting back
 * from Google that cookie is often missing (SameSite / storage edge cases), which
 * causes "PKCE code verifier not found in storage". localStorage survives the
 * round-trip reliably on the same browser.
 */
export function createOAuthBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "skillbridge-oauth-pkce",
      },
    }
  );
}
