import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("learn_subject, learn_tags")
    .eq("id", user.id)
    .maybeSingle();

  if (meError || !me) {
    return NextResponse.json({ error: "Failed to load current user profile" }, { status: 500 });
  }

  const learnSubject = me.learn_subject;
  const learnTags = Array.isArray(me.learn_tags) ? me.learn_tags : [];

  const queryParts = [learnSubject, ...learnTags].filter(Boolean);

  if (queryParts.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const { data: matches, error: matchError } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, teach_subject, teach_tags, trust_score")
    .neq("id", user.id)
    .ilike("teach_subject", `%${learnSubject ?? ""}%`)
    .or(
      learnTags
        .map((tag) => `teach_tags.cs.{${tag}}`)
        .join(",")
    );

  if (matchError) {
    console.error("Match query failed:", matchError);
    return NextResponse.json({ error: "Failed to query matches" }, { status: 500 });
  }

  return NextResponse.json({ matches: matches ?? [] });
}
