import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/auth/validation";
import { isSuspiciousSubmission } from "@/lib/auth/bot-guard";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";
import { authResponseDelay } from "@/lib/auth/timing";
import { isAdminUser } from "@/lib/auth/isAdmin";

/**
 * Dedicated, tighter limits than the regular /api/auth/login. This is the
 * only door into the admin console, so it's a natural target for
 * credential stuffing / brute force once someone finds the URL. Locking
 * out fast (and for longer) matters more here than convenience.
 */
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 8;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP_HOURLY = 15;

const GENERIC_ERROR = "Invalid email or password.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { email, password } = parsed.data;

  if (isSuspiciousSubmission(parsed.data)) {
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const ip = getClientIp(request);

  // Three independent limiters: short-window per IP, short-window per
  // email (stops targeting one admin account from many IPs), and a longer
  // hourly IP cap so someone can't just wait out the 15-minute window
  // forever. Any one tripping is enough to block the attempt.
  const ipLimit = checkRateLimit("auth:admin-login:ip", ip, MAX_ATTEMPTS_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const ipHourlyLimit = checkRateLimit(
    "auth:admin-login:ip-hourly",
    ip,
    MAX_ATTEMPTS_PER_IP_HOURLY,
    LOCKOUT_WINDOW_MS
  );
  if (!ipHourlyLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipHourlyLimit.retryAfterMs) }
    );
  }

  const emailLimit = checkRateLimit("auth:admin-login:email", email, MAX_ATTEMPTS_PER_EMAIL, WINDOW_MS);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(emailLimit.retryAfterMs) }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !data.user) {
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const admin = await isAdminUser(supabase, data.user.id);
  if (!admin) {
    // Same message and status as a wrong password — this endpoint never
    // confirms whether an account exists or lacks admin access.
    await supabase.auth.signOut();
    await authResponseDelay();
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  return NextResponse.json({ message: "Signed in" });
}
