import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, avatar_url, xp, level, trust_score")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile data:", profileError);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      xp: profile?.xp ?? 0,
      level: profile?.level ?? 0,
      trustScore:
        profile?.trust_score != null ? String(profile.trust_score) : null,
      emailConfirmed: user.email_confirmed ?? false,
    },
  });
}
