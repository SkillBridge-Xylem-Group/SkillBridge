"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import CommunityAvatar from "@/components/forum/CommunityAvatar";
import { toggleJoinCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import { useLocale } from "@/components/i18n/LocaleProvider";

type TrendingCommunity = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url: string | null;
  banner_url: string | null;
  accent_color: string;
  member_count: number;
  post_count: number;
  joined: boolean;
  is_owner: boolean;
};

export default function TrendingCommunities() {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [communities, setCommunities] = useState<TrendingCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/forum/trending-communities");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load communities");
        setCommunities((data.communities ?? []).slice(0, 3));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleJoin(community: TrendingCommunity) {
    if (busyId) return;
    setBusyId(community.id);
    setCommunities((prev) => prev.map((c) => (c.id === community.id ? { ...c, joined: true } : c)));
    try {
      const res = await toggleJoinCommunityAction(community.id, false);
      if (res?.error) {
        setCommunities((prev) => prev.map((c) => (c.id === community.id ? { ...c, joined: false } : c)));
        return;
      }
      invalidateSidebarCommunitiesCache();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="nb-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold nb-heading">Trending Communities</h2>
        <Link
          href="/dashboard/forum/communities"
          className="shrink-0 text-sm font-bold hover:underline"
          style={{ color: "var(--sb-teal-dark)" }}
        >
          {dictionary.common.viewAll}
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}

        {!loading && error && (
          <p className="text-sm text-red-500">Couldn&apos;t load trending communities.</p>
        )}

        {!loading && !error && communities.length === 0 && (
          <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
            No communities yet — be the first to create one.
          </p>
        )}

        {!loading &&
          !error &&
          communities.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/forum/c/${c.slug}`}
              className="flex items-center gap-3 rounded-2xl p-3 transition hover:-translate-y-0.5"
              style={{ background: "#fbfffc", boxShadow: "var(--sb-shadow-sm)" }}
            >
              <CommunityAvatar
                title={c.title}
                imageUrl={c.image_url}
                accentColor={c.accent_color}
                size="lg"
                shape="squircle"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold" style={{ color: "var(--sb-ink)" }}>
                  {c.title}
                </p>
                <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                  {c.member_count.toLocaleString()} members &middot; {c.post_count.toLocaleString()}{" "}
                  discussions
                </p>
              </div>

              {c.joined || c.is_owner ? (
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{ background: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)" }}
                >
                  {dictionary.common.joined}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleJoin(c);
                  }}
                  disabled={busyId === c.id}
                  className="nb-btn flex shrink-0 items-center gap-1 px-3.5 py-1.5 text-xs text-white disabled:cursor-not-allowed"
                  style={{ background: "var(--sb-gradient)" }}
                >
                  {busyId === c.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight size={13} />
                    </>
                  )}
                </button>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
