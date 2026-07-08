import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: questions, error } = await supabase
    .from("forum_questions")
    .select("id, title, created_at, reply_count, author_name, author_id, upvotes")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to fetch recent forum questions:", error);
    return NextResponse.json({ error: "Failed to fetch recent forum questions" }, { status: 500 });
  }

  return NextResponse.json({ questions: questions ?? [] });
}
