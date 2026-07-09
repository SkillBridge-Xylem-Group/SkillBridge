import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    bio,
    timezone,
    teachSubject,
    teachTags,
    learnSubject,
    learnTags,
  } = body as {
    bio?: string;
    timezone?: string;
    teachSubject?: string;
    teachTags?: string[];
    learnSubject?: string;
    learnTags?: string[];
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updateData = {
    bio: bio ?? null,
    timezone: timezone ?? null,
    teach_subject: teachSubject ?? null,
    teach_tags: teachTags ?? [],
    learn_subject: learnSubject ?? null,
    learn_tags: learnTags ?? [],
    onboarding_completed: true,
  };

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    console.error("Onboarding update failed:", updateError);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }

  return NextResponse.json({ message: "Onboarding saved" });
}
