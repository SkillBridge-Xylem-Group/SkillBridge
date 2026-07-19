"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

export default function CommunityEmptyState({
  slug,
  search,
}: {
  slug: string;
  search?: string;
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const f = dictionary.forum;

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <p className="text-lg font-extrabold text-slate-900">
        {search
          ? interpolate(f.noPostsFor, { q: search })
          : f.noPostsYet}
      </p>
      {!search ? (
        <>
          <p className="mt-2 max-w-sm text-sm text-brand">{f.startFeed}</p>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new Event("sb-forum-compose-open"));
              router.replace(`/dashboard/forum/c/${slug}?compose=1`, { scroll: false });
            }}
            className="btn-pill mt-6 inline-flex bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            {f.createPost}
          </button>
        </>
      ) : null}
    </div>
  );
}
