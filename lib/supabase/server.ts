import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for use inside Route Handlers / Server Actions.
 * Reads and writes the auth session cookies automatically via the Next.js
 * cookie store, so supabase.auth.signUp / signInWithPassword "just work".
 *
 * @param persistSession When false (the "Remember me" checkbox left
 * unchecked at login), the maxAge/expires is stripped from any auth cookie
 * this client sets so it becomes a session cookie the browser drops on
 * close, instead of the library's normal long-lived cookie.
 */
export async function createSupabaseServerClient(persistSession = true) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const finalOptions = persistSession
              ? options
              : { ...options, maxAge: undefined, expires: undefined };
            cookieStore.set(name, value, finalOptions);
          });
        },
      },
      global: {
        // In production (`next start`), Next.js caches plain fetch() calls
        // by default — including the ones Supabase's client makes under the
        // hood. Without this, a profile row fetched once gets stuck in the
        // Data Cache and keeps being served stale on every later request,
        // even after the row changes (only reproduces outside `next dev`,
        // which doesn't apply that cache).
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
