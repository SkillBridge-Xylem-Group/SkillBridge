import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

/**
 * Keep this under typical reverse-proxy limits, but high enough that a slow
 * Supabase round-trip (cold start / distant region) does not look like an outage.
 */
const AUTH_TIMEOUT_MS = 4_000;

function needsAuthentication(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  search: string,
  error?: string
) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
  if (error) loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip auth middleware for auth exchange + public pages.
  // Calling getUser() on every request causes site-wide 502 when Supabase times out.
  if (pathname.startsWith("/auth/") || !needsAuthentication(pathname)) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[proxy] missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return redirectToLogin(request, pathname, search, "auth-unavailable");
  }

  let response = NextResponse.next({
    request: {
      headers: (() => {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-pathname", pathname);
        return requestHeaders;
      })(),
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set("x-pathname", pathname);
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const authResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), AUTH_TIMEOUT_MS)),
    ]);

    if (!authResult) {
      console.warn("[proxy] auth check timed out; redirecting to login");
      return redirectToLogin(request, pathname, search, "auth-unavailable");
    }

    const {
      data: { user },
      error: authError,
    } = authResult;

    if (authError || !user) {
      return redirectToLogin(request, pathname, search);
    }

    if (!user.email_confirmed_at) {
      const usesEmailPassword = user.identities?.some((identity) => identity.provider === "email");
      if (usesEmailPassword) {
        return redirectToLogin(request, pathname, search, "confirm-email");
      }
    }
  } catch (err) {
    console.error("[proxy] auth check failed:", err);
    return redirectToLogin(request, pathname, search, "auth-unavailable");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
