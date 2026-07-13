import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthConfirmPageProps = {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    code?: string;
  }>;
};

function destinationFor(type: EmailOtpType | null) {
  return type === "recovery" ? "/reset-password" : "/login";
}

export default async function AuthConfirmPage({ searchParams }: AuthConfirmPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash;
  const type = (params.type as EmailOtpType | null) ?? null;
  const code = params.code;
  const destination = destinationFor(type);

  const supabase = await createSupabaseServerClient();

  // PKCE ?code= links (e.g. {{ .ConfirmationURL }} redirects)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) redirect(destination);
      console.error("[auth/confirm] exchangeCodeForSession:", error.message);
    } catch (err) {
      console.error("[auth/confirm] exchangeCodeForSession threw:", err);
    }
  }

  // Email template: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
  // TokenHash may be prefixed with "pkce_" — verifyOtp handles this server-side and
  // does not require the browser that requested the reset to open the link.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(destination);
    console.error("[auth/confirm] verifyOtp:", error?.message);
  }

  redirect("/login?error=confirmation-failed");
}
