import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/auth/validation";
import { isPwnedPassword } from "@/lib/auth/password";

// Simple in-memory rate limiter (per-process). For production use a shared store like Redis.
const registerAttempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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

  // basic per-IP rate limiting
  const now = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  let entry = registerAttempts.get(ip) ?? { count: 0, first: now };
  if (now - entry.first > WINDOW_MS) {
    entry = { count: 0, first: now };
  }
  entry.count++;
  registerAttempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  // check against known breached passwords
  try {
    const pwned = await isPwnedPassword(password);
    if (pwned) {
      return NextResponse.json(
        { error: "This password has appeared in a data breach. Choose a different password." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("HIBP check failed:", err);
    // continue without blocking if external check fails
  }

  try {
    const supabase = await createSupabaseServerClient();

    // No signup trigger creates a `users` row automatically — the first
    // authenticated save (see lib/profile/upsertUser.ts) creates it lazily,
    // falling back to this `name` metadata for the initial fullname.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: fullName } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 400 });
    }

    // Supabase signals "email already registered" by returning a user with no
    // identities, rather than an error (this avoids leaking which emails exist).
    if (!data.user || data.user.identities?.length === 0) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const requiresConfirmation = !data.session;

    return NextResponse.json(
      {
        message: requiresConfirmation
          ? "Registration successful. Please check your email to confirm your account."
          : "Registration successful",
        requiresConfirmation,
        user: { id: data.user.id, email: data.user.email, fullName },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
