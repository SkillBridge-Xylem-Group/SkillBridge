import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listUserSidebarCommunities } from "@/lib/forumCommunities";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communities = await listUserSidebarCommunities(supabase, user.id);
  return NextResponse.json(
    { communities },
    {
      headers: {
        // Short browser cache so soft navigations feel instant.
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
