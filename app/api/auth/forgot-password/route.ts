import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FORGOT_PER_IP = 5;
const MAX_FORGOT_PER_EMAIL = 3;

const GENERIC_MESSAGE = "If an account exists for this email, a reset link is on its way.";

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

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit("auth:forgot:ip", ip, MAX_FORGOT_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { message: GENERIC_MESSAGE },
      { status: 200, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const emailLimit = checkRateLimit(
    "auth:forgot:email",
    parsed.data.email,
    MAX_FORGOT_PER_EMAIL,
    WINDOW_MS
  );
  if (!emailLimit.allowed) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
  if (error) {
    console.error("[forgot-password] resetPasswordForEmail error:", error);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
