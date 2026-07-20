import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { recoveryCookieName, signRecoveryToken } from "@/lib/security";

const RECOVERY_TTL_MS = 15 * 60 * 1000;

type Body =
  | { token_hash: string; type: "recovery" }
  | { code: string; type: "recovery" }
  | { access_token: string; refresh_token: string; type: "recovery" };

/**
 * Completes a password-recovery email link on the server and sets an httpOnly
 * recovery cookie. Unlike a bare "mark recovery" endpoint, this only succeeds
 * when a recovery OTP / code / hash session from the email link is presented —
 * a normal logged-in session cannot mint the cookie.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body?.type !== "recovery") {
    return NextResponse.json({ error: "Invalid recovery request." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let userId: string | null = null;

  if ("token_hash" in body && body.token_hash) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: "recovery" satisfies EmailOtpType,
      token_hash: body.token_hash,
    });
    if (error || !data.user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 401 }
      );
    }
    userId = data.user.id;
  } else if ("code" in body && body.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(body.code);
    if (error || !data.user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 401 }
      );
    }
    userId = data.user.id;
  } else if ("access_token" in body && body.access_token && body.refresh_token) {
    // Implicit / hash redirect from Supabase email templates.
    // Reject stale JWTs so a long-lived login session cannot mint a recovery cookie.
    try {
      const payloadPart = body.access_token.split(".")[1];
      const json = Buffer.from(payloadPart ?? "", "base64url").toString("utf8");
      const claims = JSON.parse(json) as { iat?: number };
      const iatMs = typeof claims.iat === "number" ? claims.iat * 1000 : 0;
      const ageMs = Date.now() - iatMs;
      if (!iatMs || ageMs > RECOVERY_TTL_MS || ageMs < -60_000) {
        return NextResponse.json(
          { error: "Recovery session is too old. Request a new reset email." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Invalid recovery token." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    });
    if (error || !data.user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 401 }
      );
    }
    userId = data.user.id;
  } else {
    return NextResponse.json({ error: "Missing recovery credentials." }, { status: 400 });
  }

  const expiresAt = Date.now() + RECOVERY_TTL_MS;
  const token = signRecoveryToken(userId, expiresAt);
  response.cookies.set(recoveryCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(RECOVERY_TTL_MS / 1000),
  });

  return response;
}
