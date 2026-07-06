import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Target of the confirmation link sent by Supabase Auth. The "Confirm signup"
// email template points here: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
// Always lands on /login regardless of any "next" param the email template
// may include, since Supabase's default templates hardcode next=/.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation-failed`);
}
