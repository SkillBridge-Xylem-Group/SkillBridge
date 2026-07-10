import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const skillsSchema = z.object({
  offered: z.array(z.string()).optional(),
  wanted: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = skillsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid skills payload" }, { status: 400 });
  }

  const update: Record<string, string[]> = {};
  if (parsed.data.offered) update.skills_offered = parsed.data.offered;
  if (parsed.data.wanted) update.skills_wanted = parsed.data.wanted;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save skills" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
