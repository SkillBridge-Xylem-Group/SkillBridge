import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Errors here (e.g. rate limiting) aside, we always return the same generic
  // message regardless of whether the email exists, so this endpoint can't be
  // used to enumerate registered accounts. The destination link itself is
  // controlled by the "Reset Password" email template in Supabase (Site URL +
  // /auth/confirm?token_hash=...&type=recovery), same as the signup template.
  await supabase.auth.resetPasswordForEmail(parsed.data.email);

  return NextResponse.json({
    message: "If an account exists for this email, a reset link is on its way.",
  });
}
