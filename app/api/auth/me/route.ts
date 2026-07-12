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
    .from("users")
    .select("fullname")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile data:", profileError);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: profile?.fullname ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      emailConfirmed: Boolean(user.email_confirmed_at),
    },
  });
}
