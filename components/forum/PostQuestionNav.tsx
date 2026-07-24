"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { forumSubforumPath } from "@/lib/forumSubforums";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { SetTopbarLeading } from "@/components/dashboard/TopbarLeading";

type PostQuestionNavProps = {
  communitySlug: string;
  communityTitle: string;
};

function PostQuestionBackButton({ communitySlug, communityTitle }: PostQuestionNavProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const communityHref = forumSubforumPath(communitySlug);
  const backLabel = interpolate(f.backToCommunity, { community: communityTitle });

  return (
    <Link
      href={communityHref}
      aria-label={backLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      style={{ boxShadow: "var(--sb-shadow-sm)" }}
    >
      <ArrowLeft size={18} strokeWidth={2.25} />
    </Link>
  );
}

function PostQuestionBreadcrumbs({ communitySlug, communityTitle }: PostQuestionNavProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const communityHref = forumSubforumPath(communitySlug);

  return (
    <nav
      aria-label={f.communities}
      className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm"
      style={{ color: "var(--sb-muted)" }}
    >
      <Link href="/dashboard/forum" className="font-semibold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
        {f.communities}
      </Link>
      <span aria-hidden>/</span>
      <Link href={communityHref} className="truncate font-semibold hover:underline" style={{ color: "var(--sb-teal-dark)" }}>
        {communityTitle}
      </Link>
    </nav>
  );
}

export default function PostQuestionNav({ communitySlug, communityTitle }: PostQuestionNavProps) {
  return (
    <>
      <SetTopbarLeading>
        <PostQuestionBackButton communitySlug={communitySlug} communityTitle={communityTitle} />
      </SetTopbarLeading>
      <PostQuestionBreadcrumbs communitySlug={communitySlug} communityTitle={communityTitle} />
    </>
  );
}
