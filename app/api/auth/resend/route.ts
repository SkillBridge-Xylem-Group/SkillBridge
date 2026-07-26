import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resendConfirmationSchema } from "@/lib/auth/validation";
import { checkRateLimitAsync, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_RESEND_PER_IP = 5;
const MAX_RESEND_PER_EMAIL = 3;

// Deliberately generic and identical whether the email exists, is already
// confirmed, or was never registered — a resend endpoint that behaves
// differently for "unknown email" vs "known email" is an account-enumeration
// oracle, so every non-rate-limited outcome returns this same message.
const RESEND_MESSAGE =
  "If this email has a pending account, a new confirmation link is on its way.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resendConfirmationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const ip = getClientIp(request);

  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimitAsync("auth:resend:ip", ip, MAX_RESEND_PER_IP, WINDOW_MS),
    checkRateLimitAsync("auth:resend:email", email, MAX_RESEND_PER_EMAIL, WINDOW_MS),
  ]);

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(emailLimit.retryAfterMs) }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    // Errors (unknown email, already confirmed, etc.) are intentionally
    // swallowed into the same generic response above — only surface
    // unexpected server errors, never auth-specific ones.
    await supabase.auth.resend({ type: "signup", email });

    return NextResponse.json({ message: RESEND_MESSAGE }, { status: 200 });
  } catch (err) {
    console.error("[resend] error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
