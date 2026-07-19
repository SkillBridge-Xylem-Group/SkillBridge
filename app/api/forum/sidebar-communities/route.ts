import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { listUserSidebarCommunities } from "@/lib/forumCommunities";

export async function GET() {
  const { user, supabase, error } = await requireActiveUser();
  if (error) return error;

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
