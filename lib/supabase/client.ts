import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton — every one of the ~15 components/hooks that import this were
 * calling createBrowserClient() fresh on each invocation, each spinning up
 * its own GoTrueClient against the same storage key. That's what was
 * actually triggering "Multiple GoTrueClient instances detected" (not the
 * separate OAuth client below, which is a deliberate, distinct instance).
 * Reuse one instance across the whole browser session instead.
 */
let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        // Required so cookies are sent when returning from Google (HTTPS sites).
        secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
      },
    }
  );

  return browserClient;
}
