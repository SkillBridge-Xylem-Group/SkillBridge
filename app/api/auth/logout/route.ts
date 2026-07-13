import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[logout] signOut error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "Logged out" });
}
