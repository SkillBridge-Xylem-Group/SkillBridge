import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { checkPasswordBreached } from "@/lib/auth/password";
import { checkRateLimitAsync, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { cookies } from "next/headers";
import { recoveryCookieName, verifyRecoveryToken } from "@/lib/security";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_RESET_PER_IP = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = await checkRateLimitAsync("auth:reset:ip", ip, MAX_RESET_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) {
    return NextResponse.json(
      { error: "Your password reset link has expired. Please request a new one." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  const recoveryOk = verifyRecoveryToken(cookieStore.get(recoveryCookieName())?.value, user.id);
  if (!recoveryOk) {
    return NextResponse.json(
      {
        error:
          "Password reset must be started from the email link. Request a new reset email if this persists.",
      },
      { status: 403 }
    );
  }

  const breachCheck = await checkPasswordBreached(parsed.data.password);
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

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 400 });
  }

  cookieStore.delete(recoveryCookieName());
  return NextResponse.json({ message: "Password updated successfully" });
}
