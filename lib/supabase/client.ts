import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
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
}
