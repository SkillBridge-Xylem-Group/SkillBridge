"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatRelativeTimeLabel } from "@/lib/i18n/locales";
import { forumSubforumPath } from "@/lib/forumSubforums";
import { interpolate } from "@/lib/i18n/interpolate";
import ForumAuthorAvatar from "./ForumAuthorAvatar";

type PostQuestionMetaProps = {
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  communitySlug: string;
  communityTitle: string;
};

export default function PostQuestionMeta({
  authorName,
  authorAvatarUrl,
  createdAt,
  communitySlug,
  communityTitle,
}: PostQuestionMetaProps) {
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const communityHref = forumSubforumPath(communitySlug);
  const timeLabel = formatRelativeTimeLabel(createdAt, dictionary.common, locale);

  return (
    <div className="flex items-start gap-3">
      <ForumAuthorAvatar name={authorName} avatarUrl={authorAvatarUrl} className="h-10 w-10" />
      <div className="min-w-0">
        <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
          <Link href={communityHref} className="font-semibold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
            {communityTitle}
          </Link>
          <span> · </span>
          <span className="font-bold" style={{ color: "var(--sb-ink)" }}>
            {authorName}
          </span>
          <span> · </span>
          <span>{timeLabel}</span>
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--sb-muted)" }}>
          {interpolate(f.postingIn, { title: communityTitle })}
        </p>
      </div>
    </div>
  );
}
