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

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // profiles has an "anyone can read" SELECT policy, so the session-bound
  // client can fetch it directly without needing the service-role key.
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    message: "Login successful",
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile?.name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    },
  });
}
