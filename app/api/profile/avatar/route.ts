import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AVATAR_OPTIONS } from "@/lib/avatars";

const avatarSchema = z.object({
  avatarId: z.enum(AVATAR_OPTIONS.map((option) => option.id) as [string, ...string[]]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = avatarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid avatar selection" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: parsed.data.avatarId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Avatar updated" });
}
