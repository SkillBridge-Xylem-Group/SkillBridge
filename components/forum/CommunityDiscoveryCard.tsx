"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { communityAccentHex } from "@/lib/forumCommunities";
import CommunityAvatar from "@/components/forum/CommunityAvatar";
import { useLocale } from "@/components/i18n/LocaleProvider";

type CommunityDiscoveryCardProps = {
  community: ForumCommunity;
  joinControl: React.ReactNode;
};

/** Discovery card with banner + overlapping icon — SkillBridge light theme. */
export default function CommunityDiscoveryCard({ community, joinControl }: CommunityDiscoveryCardProps) {
  const { dictionary } = useLocale();
  const c = dictionary.common;
  const f = dictionary.forum;
  const accentHex = communityAccentHex(community.accent_color);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:border-slate-300"
      style={{ boxShadow: "var(--sb-shadow-sm)" }}
    >
      <Link
        href={`/dashboard/forum/c/${community.slug}`}
        className="relative block aspect-[16/9] w-full overflow-hidden"
      >
        {community.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.banner_url}
            alt=""
            className="h-full w-full object-cover object-center transition duration-300 group-hover:brightness-[0.98]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accentHex} 88%, white) 0%, color-mix(in srgb, ${accentHex} 45%, #14b8a6) 100%)`,
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </Link>

      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-0">
        <div className="-mt-8 mb-2 flex items-end justify-between gap-2">
          <Link href={`/dashboard/forum/c/${community.slug}`} className="shrink-0">
            <CommunityAvatar
              title={community.title}
              imageUrl={community.image_url}
              accentColor={community.accent_color}
              size="lg"
              contrast
            />
          </Link>
          <div className="mb-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {joinControl}
          </div>
        </div>

        <Link href={`/dashboard/forum/c/${community.slug}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-extrabold tracking-tight" style={{ color: "var(--sb-ink)" }}>
              {community.title}
            </h3>
          </div>
          {community.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-snug" style={{ color: "var(--sb-muted)" }}>
              {community.description}
            </p>
          ) : null}
        </Link>

        <div
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold"
          style={{ color: "var(--sb-muted)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} className="shrink-0" style={{ color: "var(--sb-teal-dark)" }} aria-hidden />
            {community.member_count.toLocaleString()}{" "}
            {community.member_count === 1 ? c.member : c.members}
          </span>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <span>
            {community.post_count} {community.post_count === 1 ? f.post : f.posts}
          </span>
        </div>
      </div>
    </article>
  );
}
