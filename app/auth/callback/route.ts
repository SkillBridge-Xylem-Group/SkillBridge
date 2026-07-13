import { NextResponse, type NextRequest } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

// Target of OAuth provider redirects and PKCE password-recovery redirects:
// resetPasswordForEmail({ redirectTo: `${origin}/auth/callback?next=/reset-password` })
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
  }

  try {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseRouteHandlerClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    console.error("[auth/callback] exchangeCodeForSession:", error);
  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
}
