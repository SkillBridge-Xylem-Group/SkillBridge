import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { getUserThreads } from "@/lib/messages";

export async function GET() {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const threads = await getUserThreads(supabase, user.id);
  return NextResponse.json({ threads });
}
