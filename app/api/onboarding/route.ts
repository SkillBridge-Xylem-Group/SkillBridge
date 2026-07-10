import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/onboarding/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bio, timezone, teachSubject, teachTags, learnSubject, learnTags } = parsed.data;

  // Dedupe: the subject is also surfaced as a tag so profile displays are
  // consistent whether they show skills_offered/skills_wanted as one list.
  const skillsOffered = Array.from(new Set([teachSubject, ...teachTags]));
  const skillsWanted = Array.from(new Set([learnSubject, ...learnTags]));

  const { error } = await supabase
    .from("profiles")
    .update({
      bio,
      timezone,
      skills_offered: skillsOffered,
      skills_wanted: skillsWanted,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Onboarding saved" });
}
