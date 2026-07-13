import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase client for auth Route Handlers that redirect after setting cookies.
 * Using `cookies()` from next/headers here can fail behind nginx and leave
 * session cookies off the redirect response (502 / broken recovery flow).
 */
export function createSupabaseRouteHandlerClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
