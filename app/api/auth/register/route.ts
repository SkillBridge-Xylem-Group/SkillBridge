import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/auth/validation";

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
