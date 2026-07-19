import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

export async function GET() {
  const { user, supabase, error } = await requireActiveUser();
  if (error) return error;

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
