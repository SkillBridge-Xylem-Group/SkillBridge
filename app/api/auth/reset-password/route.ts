import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { isPwnedPassword } from "@/lib/auth/password";

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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Landing here without a valid recovery session means the link was already
  // used, expired, or was never verified via /auth/confirm.
  if (!user) {
    return NextResponse.json(
      { error: "Your password reset link has expired. Please request a new one." },
      { status: 401 }
    );
  }

  // check if password has been seen in a breach
  try {
    const pwned = await isPwnedPassword(parsed.data.password);
    if (pwned) {
      return NextResponse.json(
        { error: "This password has appeared in a data breach. Choose a different password." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("HIBP check failed:", err);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 400 });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
