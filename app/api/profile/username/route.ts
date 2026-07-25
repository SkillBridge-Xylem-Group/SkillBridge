import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import {
  isUsernameAvailable,
  normalizeUsernameInput,
  validateUsernameFormat,
} from "@/lib/username";

const updateSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username");
  if (!raw) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const format = validateUsernameFormat(raw);
  if (!("ok" in format)) {
    return NextResponse.json({
      available: false,
      username: normalizeUsernameInput(raw),
      reason: format.error,
    });
  }

  const available = await isUsernameAvailable(supabase, format.username, user.id);
  return NextResponse.json({ available, username: format.username });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const format = validateUsernameFormat(parsed.data.username);
  if (!("ok" in format)) {
    return NextResponse.json({ error: format.error }, { status: 400 });
  }

  const available = await isUsernameAvailable(supabase, format.username, user.id);
  if (!available) {
    return NextResponse.json({ error: "TAKEN" }, { status: 409 });
  }

  const { data: existing } = await supabase.from("users").select("slug").eq("id", user.id).maybeSingle();
  if (existing?.slug === format.username) {
    return NextResponse.json({ username: format.username });
  }

  const { error } = await supabase.from("users").update({ slug: format.username }).eq("id", user.id);
  if (error) {
    if (error.message?.toLowerCase().includes("unique") || error.message?.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "TAKEN" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/profile");
  revalidatePath(`/dashboard/profile/${format.username}`);
  if (existing?.slug && existing.slug !== format.username) {
    revalidatePath(`/dashboard/profile/${existing.slug}`);
  }
  revalidatePath("/dashboard/browse");

  return NextResponse.json({ username: format.username });
}
