import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/auth/validation";
import { checkPasswordBreached } from "@/lib/auth/password";
import { isSuspiciousSubmission } from "@/lib/auth/bot-guard";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REGISTER_PER_IP = 5;
const MAX_REGISTER_PER_EMAIL = 3;

const REGISTRATION_SUCCESS_MESSAGE =
  "If this email is eligible for an account, please check your inbox to confirm your registration.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { fullName, email, password } = parsed.data;

  if (isSuspiciousSubmission(parsed.data)) {
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit("auth:register:ip", ip, MAX_REGISTER_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const emailLimit = checkRateLimit("auth:register:email", email, MAX_REGISTER_PER_EMAIL, WINDOW_MS);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(emailLimit.retryAfterMs) }
    );
  }

  const breachCheck = await checkPasswordBreached(password);
  if (breachCheck === "pwned") {
    return NextResponse.json(
      { error: "This password has appeared in a data breach. Choose a different password." },
      { status: 400 }
    );
  }
  if (breachCheck === "unavailable") {
    return NextResponse.json(
      { error: "Unable to verify password safety right now. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: fullName } },
    });

    if (error) {
      console.error("[register] signUp error:", error);
      // Generic response — do not leak whether the email exists or other internals.
      return NextResponse.json(
        {
          message: REGISTRATION_SUCCESS_MESSAGE,
          requiresConfirmation: true,
        },
        { status: 201 }
      );
    }

    const alreadyRegistered = !data.user || data.user.identities?.length === 0;
    const requiresConfirmation = alreadyRegistered || !data.session;

    return NextResponse.json(
      {
        message: REGISTRATION_SUCCESS_MESSAGE,
        requiresConfirmation,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
