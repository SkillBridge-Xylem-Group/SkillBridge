import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/auth/validation";
import { isSuspiciousSubmission } from "@/lib/auth/bot-guard";
import { checkRateLimitAsync, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";
import { authResponseDelay } from "@/lib/auth/timing";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_PER_IP = 20;
const MAX_LOGIN_PER_EMAIL = 8;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, remember } = parsed.data;

  if (isSuspiciousSubmission(parsed.data)) {
    await authResponseDelay();
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ip = getClientIp(request);

  const ipLimit = await checkRateLimitAsync("auth:login:ip", ip, MAX_LOGIN_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const emailLimit = await checkRateLimitAsync(
    "auth:login:email",
    email,
    MAX_LOGIN_PER_EMAIL,
    WINDOW_MS
  );
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(emailLimit.retryAfterMs) }
    );
  }

  const supabase = await createSupabaseServerClient(remember ?? false);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await authResponseDelay();
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (!data.user.email_confirmed_at) {
    const usesEmailPassword = data.user.identities?.some((identity) => identity.provider === "email");
    if (usesEmailPassword) {
      await supabase.auth.signOut();
      await authResponseDelay();
      return NextResponse.json(
        { error: "Please confirm your email before signing in." },
        { status: 403 }
      );
    }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("fullname, is_suspended, suspended_reason")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.is_suspended) {
    await supabase.auth.signOut();
    await authResponseDelay();
    return NextResponse.json(
      {
        error: profile.suspended_reason
          ? `Your account has been suspended: ${profile.suspended_reason}`
          : "Your account has been suspended. Contact an administrator for help.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Login successful",
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile?.fullname ?? null,
    },
  });
}