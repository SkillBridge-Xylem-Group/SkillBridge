"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, Star } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { toggleJoinCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import CommunityAvatar from "@/components/forum/CommunityAvatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLocale } from "@/components/i18n/LocaleProvider";

const FAVORITES_KEY = "sb-community-favorites";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveFavorites(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

type ManageCommunitiesProps = {
  communities: ForumCommunity[];
  viewerId: string;
};

export default function ManageCommunities({
  communities: initial,
  viewerId,
}: ManageCommunitiesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [communities, setCommunities] = useState(initial);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<ForumCommunity | null>(null);
  const [error, setError] = useState("");

  // Stay inside the admin chrome when this component is rendered under
  // /dashboard/admin/* — otherwise "Discover communities" would take an
  // admin viewing this page straight back to the regular user layout.
  const isAdminContext = pathname.startsWith("/dashboard/admin");
  const discoverHref = isAdminContext ? "/dashboard/admin/forum" : "/dashboard/forum";

  useEffect(() => {
    setCommunities(initial);
  }, [initial]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return next;
    });
  }

  function requestLeave(community: ForumCommunity) {
    if (community.created_by === viewerId) {
      setError(f.leaveCommunityAsOwner);
      return;
    }
    setLeaveTarget(community);
  }

  function confirmLeave() {
    const community = leaveTarget;
    if (!community || pendingId) return;
    void (async () => {
      setPendingId(community.id);
      setError("");
      try {
        const res = await toggleJoinCommunityAction(community.id, true);
        if (res?.error) {
          setError(res.error);
          return;
        }
        setCommunities((prev) => prev.filter((c) => c.id !== community.id));
        setLeaveTarget(null);
        invalidateSidebarCommunitiesCache();
        router.refresh();
      } finally {
        setPendingId(null);
      }
    })();
  }

  const joined = useMemo(
    () =>
      communities
        .filter((c) => c.joined)
        .sort((a, b) => {
          const aOwned = a.created_by === viewerId ? 0 : 1;
          const bOwned = b.created_by === viewerId ? 0 : 1;
          if (aOwned !== bOwned) return aOwned - bOwned;
          return a.title.localeCompare(b.title);
        }),
    [communities, viewerId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return joined.filter((c) => {
      if (tab === "favorites" && !favorites.has(c.id)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [joined, query, tab, favorites]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{f.manageTitle}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="min-w-0 space-y-4">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={f.manageFilterPlaceholder}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <p className="text-base font-bold text-slate-900">
                {joined.length === 0
                  ? f.notJoinedYet
                  : tab === "favorites"
                    ? f.noFavorites
                    : f.noFilterMatch}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {joined.length === 0
                  ? f.joinFromForum
                  : f.tryDifferentFilter}
              </p>
              {joined.length === 0 ? (
                <Link
                  href={discoverHref}
                  className="mt-5 inline-flex rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "var(--sb-gradient)" }}
                >
                  {f.discoverCta}
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {filtered.map((community) => {
                const favorited = favorites.has(community.id);
                const busy = pendingId === community.id;
                return (
                  <li
                    key={community.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap sm:gap-4"
                  >
                    <Link
                      href={`/dashboard/forum/c/${community.slug}`}
                      className="flex min-w-0 flex-1 items-start gap-3"
                    >
                      <CommunityAvatar
                        title={community.title}
                        imageUrl={community.image_url}
                        accentColor={community.accent_color}
                        size="md"
                      />
                      <span className="min-w-0 pt-0.5">
                        <span className="block truncate text-sm font-bold text-slate-900 hover:underline">
                          {community.title}
                        </span>
                        {community.description ? (
                          <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {community.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={favorited ? f.unfavorite : f.favorite}
                        onClick={() => toggleFavorite(community.id)}
                        className={`rounded-full p-2 transition ${
                          favorited
                            ? "text-amber-400"
                            : "text-slate-300 hover:bg-slate-50 hover:text-amber-400"
                        }`}
                      >
                        <Star
                          size={18}
                          className={favorited ? "fill-amber-400" : ""}
                          strokeWidth={1.75}
                        />
                      </button>
                      <button
                        type="button"
                        disabled={busy || community.created_by === viewerId}
                        onClick={() => requestLeave(community)}
                        aria-busy={busy}
                        title={
                          community.created_by === viewerId
                            ? f.leaveCommunityAsOwner
                            : f.leaveCommunity
                        }
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold transition disabled:cursor-default disabled:opacity-80 ${
                          community.created_by === viewerId
                            ? "border-slate-300 bg-white text-slate-700"
                            : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                        {community.created_by === viewerId
                          ? dictionary.common.joined
                          : dictionary.common.leave}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="lg:pt-1">
          <nav className="sticky top-20 space-y-0.5 rounded-xl border border-slate-200 bg-white p-1.5">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                tab === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.allCommunities}
            </button>
            <button
              type="button"
              onClick={() => setTab("favorites")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                tab === "favorites"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.favoritesTab}
            </button>
          </nav>
        </aside>
      </div>

      <ConfirmDialog
        open={!!leaveTarget}
        title={f.leaveCommunityConfirmTitle}
        description={f.leaveCommunityConfirmDesc}
        confirmLabel={f.leaveCommunity}
        cancelLabel={dictionary.common.cancel}
        danger
        busy={leaveTarget != null && pendingId === leaveTarget.id}
        busyLabel={dictionary.common.loading}
        onCancel={() => {
          if (!pendingId) setLeaveTarget(null);
        }}
        onConfirm={confirmLeave}
      />
    </div>
  );
}