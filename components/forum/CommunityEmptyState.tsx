"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { openForumCompose } from "@/components/forum/QuestionComposer";

export default function CommunityEmptyState({
  slug,
  search,
  canPost = true,
}: {
  slug: string;
  search?: string;
  canPost?: boolean;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <p className="text-lg font-extrabold text-slate-900">
        {search
          ? interpolate(f.noPostsFor, { q: search })
          : f.noPostsYet}
      </p>
      {!search && canPost ? (
        <>
          <p className="mt-2 max-w-sm text-sm text-brand">{f.startFeed}</p>
          <button
            type="button"
            onClick={() => {
              openForumCompose(`/dashboard/forum/c/${slug}?compose=1`);
            }}
            className="mt-6 inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            {f.createPost}
          </button>
        </>
      ) : null}
    </div>
  );
}
