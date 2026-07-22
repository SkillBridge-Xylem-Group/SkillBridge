import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { updateOrCreateUser } from "@/lib/profile/upsertUser";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  bio: z.string().trim().max(300, "Bio is too long").optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const { error } = await updateOrCreateUser(supabase, user, {
    fullname: parsed.data.name,
    bio: parsed.data.bio ?? "",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Profile saved" });
}
