import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function destinationFor(type: EmailOtpType | null) {
  return type === "recovery" ? "/reset-password" : "/login";
}

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const destination = destinationFor(type);

  try {
    if (code) {
      const response = NextResponse.redirect(`${origin}${destination}`);
      const supabase = createSupabaseRouteHandlerClient(request, response);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return response;
      console.error("[auth/confirm] exchangeCodeForSession:", error.message);
    }

    if (tokenHash && type) {
      const response = NextResponse.redirect(`${origin}${destination}`);
      const supabase = createSupabaseRouteHandlerClient(request, response);
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return response;
      console.error("[auth/confirm] verifyOtp:", error.message);
    }
  } catch (err) {
    console.error("[auth/confirm] unexpected error:", err);
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation-failed`);
}
