"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { ForumQuestionSummary } from "@/lib/forum";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { communityAccentHex, normalizeCommunityAccent } from "@/lib/forumCommunities";
import { forumSubforumPath } from "@/lib/forumSubforums";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";
import CommunityAvatar from "./CommunityAvatar";
import CommunityTrendingCard from "./CommunityTrendingCard";

type PostPageSidebarProps = {
  community: ForumCommunity | null;
  communitySlug: string;
  communityTitle: string;
  communityDescription: string;
  questions: ForumQuestionSummary[];
  currentQuestionId: string;
};

function CommunityAboutCard({
  community,
  communitySlug,
  communityTitle,
  communityDescription,
}: {
  community: ForumCommunity | null;
  communitySlug: string;
  communityTitle: string;
  communityDescription: string;
}) {
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const c = dictionary.common;
  const communityHref = forumSubforumPath(communitySlug);
  const accent = normalizeCommunityAccent(community?.accent_color);
  const accentHex = communityAccentHex(accent);
  const memberCount = community?.member_count ?? 0;
  const postCount = community?.post_count ?? 0;
  const category = community?.category;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="h-14 w-full"
        style={{
          background: community?.banner_url
            ? `url(${community.banner_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${accentHex}33 0%, ${accentHex}18 50%, #f8fafc 100%)`,
        }}
      />
      <div className="px-4 pb-4">
        <div className="-mt-6">
          <CommunityAvatar
            title={communityTitle}
            imageUrl={community?.image_url}
            accentColor={accent}
            size="lg"
            contrast
          />
        </div>
        <h2 className="mt-3 text-base font-extrabold nb-heading">{communityTitle}</h2>
        {category ? (
          <p className="mt-1 text-xs font-semibold" style={{ color: "var(--sb-teal-dark)" }}>
            {categoryLabel(locale, category)}
          </p>
        ) : null}
        {communityDescription ? (
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed" style={{ color: "var(--sb-muted)" }}>
            {communityDescription}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
          <span className="inline-flex items-center gap-1">
            <Users size={13} />
            {memberCount} {memberCount === 1 ? c.member : c.members}
          </span>
          <span>
            {postCount} {postCount === 1 ? f.post : f.posts}
          </span>
        </div>
        <Link
          href={communityHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold transition hover:border-slate-300 hover:bg-slate-50"
          style={{ color: "var(--sb-ink)" }}
        >
          {f.visitCommunity}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function MorePostsCard({
  communityTitle,
  questions,
  currentQuestionId,
}: {
  communityTitle: string;
  questions: ForumQuestionSummary[];
  currentQuestionId: string;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const recent = questions.filter((q) => q.question_id !== currentQuestionId).slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-extrabold nb-heading">{interpolate(f.morePostsIn, { title: communityTitle })}</h2>
      <ul className="mt-3 space-y-3">
        {recent.map((q) => (
          <li key={q.question_id}>
            <Link
              href={`/dashboard/forum/${q.question_id}`}
              className="line-clamp-2 text-sm font-semibold hover:underline"
              style={{ color: "var(--sb-ink)" }}
            >
              {q.title}
            </Link>
            <p className="mt-0.5 text-xs" style={{ color: "var(--sb-muted)" }}>
              {q.answer_count} {q.answer_count === 1 ? f.reply : f.replies}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PostPageSidebar({
  community,
  communitySlug,
  communityTitle,
  communityDescription,
  questions,
  currentQuestionId,
}: PostPageSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <CommunityAboutCard
        community={community}
        communitySlug={communitySlug}
        communityTitle={communityTitle}
        communityDescription={communityDescription}
      />
      <CommunityTrendingCard communityTitle={communityTitle} questions={questions} />
      <MorePostsCard communityTitle={communityTitle} questions={questions} currentQuestionId={currentQuestionId} />
    </aside>
  );
}
