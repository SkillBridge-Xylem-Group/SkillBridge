import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/auth/rate-limit";
import { getRequestOrigin } from "@/lib/request-origin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 8;

const changeEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .email("Invalid email address"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = changeEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit("auth:change-email:ip", ip, MAX_PER_IP, WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(ipLimit.retryAfterMs) }
    );
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  if ((user.email ?? "").toLowerCase() === parsed.data.email) {
    return NextResponse.json({ error: "That is already your email address." }, { status: 400 });
  }

  const origin = getRequestOrigin(request);
  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
    // Supabase sends confirmation links; Site URL / redirect allow-list must include settings.
    data: { email_change_requested_from: origin },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 400 });
  }

  return NextResponse.json({
    message: "Check your inbox to confirm the new email address.",
  });
}
