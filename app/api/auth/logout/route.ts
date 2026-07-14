import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

/** Expire every Supabase auth cookie on the outgoing response. */
function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (!name.startsWith("sb-")) continue;
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Logged out" });

  try {
    const supabase = createSupabaseRouteHandlerClient(request, response);
    // Revoke refresh token + write cleared session cookies onto `response`.
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      console.error("[logout] signOut error:", error.message);
    }
  } catch (err) {
    console.error("[logout] unexpected error:", err);
  }

  // Always wipe sb-* cookies even if signOut failed or skipped some chunks.
  clearSupabaseAuthCookies(request, response);
  return response;
}
