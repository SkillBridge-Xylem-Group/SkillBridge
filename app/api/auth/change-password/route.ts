import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkPasswordBreached, isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_CHANGE_PER_IP = 10;

const passwordRequirementsMessage =
  "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(PASSWORD_MAX_LENGTH),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(PASSWORD_MAX_LENGTH, "Password is too long")
      .refine(isPasswordValid, { message: passwordRequirementsMessage }),
    confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit("auth:change-password:ip", ip, MAX_CHANGE_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const usesEmailPassword = user.identities?.some((identity) => identity.provider === "email");
  if (!usesEmailPassword) {
    return NextResponse.json(
      { error: "Password changes are managed by your Google account." },
      { status: 400 }
    );
  }

  if (!user.email) {
    return NextResponse.json({ error: "No email on this account." }, { status: 400 });
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
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

  return NextResponse.json({ message: "Password updated successfully" });
}
