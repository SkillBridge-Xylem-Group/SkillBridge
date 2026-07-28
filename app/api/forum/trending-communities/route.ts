import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { listCommunities } from "@/lib/forumCommunities";


export async function GET() {
  const { user, supabase, error } = await requireActiveUser();
  if (error) return error;

  const communities = await listCommunities(supabase, { userId: user.id });

  const trending = communities
    .slice()
    .sort((a, b) => b.member_count - a.member_count || b.post_count - a.post_count)
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      image_url: c.image_url,
      banner_url: c.banner_url,
      accent_color: c.accent_color,
      member_count: c.member_count,
      post_count: c.post_count,
      joined: c.joined,
      is_owner: c.created_by === user.id,
    }));

  return NextResponse.json(
    { communities: trending },
    {
      headers: {
        // Short browser cache so soft navigations feel instant, matching
        // the sidebar-communities endpoint's caching strategy.
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}