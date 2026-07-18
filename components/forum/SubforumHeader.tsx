import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import CommunityAvatar from "@/components/forum/CommunityAvatar";

/** Server-safe header when Join is rendered separately; prefer CommunityPageHeader client. */
export default function SubforumHeader({
  subforum,
  postCount,
}: {
  subforum: { slug: string; title: string; description: string; image: string | null };
  postCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="relative h-28 bg-gradient-to-br from-brand-light via-sky-50 to-slate-100 sm:h-36" />
      <div className="relative px-5 pb-4">
        <div className="-mt-8">
          <CommunityAvatar title={subforum.title} imageUrl={subforum.image} accentColor="brand" size="lg" />
        </div>
        <Link
          href="/dashboard/forum"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          <ArrowLeft size={14} />
          All communities
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{subforum.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subforum.description}</p>
        <p className="mt-2 text-xs font-semibold text-slate-400">
          {postCount} {postCount === 1 ? "post" : "posts"}
        </p>
      </div>
    </div>
  );
}

export function communityToSubforumShape(c: ForumCommunity) {
  return {
    slug: c.slug,
    title: c.title,
    description: c.description,
    image: c.image_url,
  };
}
