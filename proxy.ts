import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

/** Avoid hanging forever when Supabase is unreachable (causes nginx 502). */
const AUTH_TIMEOUT_MS = 3_000;

function needsAuthentication(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip auth middleware for auth exchange + public pages.
  // Calling getUser() on every request causes site-wide 502 when Supabase times out.
  if (pathname.startsWith("/auth/") || !needsAuthentication(pathname)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const userResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), AUTH_TIMEOUT_MS)),
    ]);

    if (!userResult) {
      // Supabase unreachable / too slow — send user to login rather than hang nginx.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
      loginUrl.searchParams.set("error", "auth-unavailable");
      return NextResponse.redirect(loginUrl);
    }

    const {
      data: { user },
    } = userResult;

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!user.email_confirmed_at) {
      const usesEmailPassword = user.identities?.some((identity) => identity.provider === "email");
      if (usesEmailPassword) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "confirm-email");
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (err) {
    console.error("[proxy] auth check failed:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    loginUrl.searchParams.set("error", "auth-unavailable");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
