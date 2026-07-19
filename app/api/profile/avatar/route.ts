import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { updateOrCreateUser } from "@/lib/profile/upsertUser";

const avatarSchema = z.object({
  avatarUrl: z.string().url(),
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
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const { error } = await updateOrCreateUser(supabase, user, {
    avatar_url: parsed.data.avatarUrl,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Avatar saved" });
}
