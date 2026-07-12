import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/auth/validation";

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
  const supabase = await createSupabaseServerClient(remember ?? false);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // users has an "anyone can read" SELECT policy, so the session-bound
  // client can fetch it directly without needing the service-role key.
  const { data: profile } = await supabase
    .from("users")
    .select("fullname")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    message: "Login successful",
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile?.fullname ?? null,
    },
  });
}
