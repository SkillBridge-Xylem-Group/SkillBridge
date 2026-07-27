"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { COMMUNITY_CATEGORIES, COMMUNITY_TOPICS } from "@/lib/forumCommunities";
import type { WantedSkillRef } from "@/lib/forumCommunityRecommendations";
import { toggleJoinCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import CreateCommunityModal from "@/components/forum/CreateCommunityModal";
import CommunityDiscoveryCard from "@/components/forum/CommunityDiscoveryCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";

type CommunitiesDiscoveryProps = {
  communities: ForumCommunity[];
  viewerId: string;
  wantedSkills?: WantedSkillRef[];
  initialCategory?: string;
  initialCreateOpen?: boolean;
};

const INITIAL_VISIBLE = 6;
const ALL = "All";

function sortByActivity(list: ForumCommunity[]) {
  return list.slice().sort((a, b) => {
    if (a.joined !== b.joined) return a.joined ? 1 : -1;
    const activity = b.post_count + b.member_count - (a.post_count + a.member_count);
    if (activity !== 0) return activity;
    if (a.is_official !== b.is_official) return a.is_official ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

/** Trending = most discussion activity (posts) first. */
function sortByTrending(list: ForumCommunity[]) {
  return list.slice().sort((a, b) => {
    if (b.member_count !== a.member_count) {
      return b.member_count - a.member_count;
    }
    if (b.post_count !== a.post_count) {
      return b.post_count - a.post_count;
    }
    return a.title.localeCompare(b.title);
  });
}

/** Popular = biggest membership first. */
function sortByPopular(list: ForumCommunity[]) {
  return list.slice().sort((a, b) => {
    if (b.post_count !== a.post_count) {
      return b.post_count - a.post_count;
    }
    if (b.member_count !== a.member_count) {
      return b.member_count - a.member_count;
    }
    return a.title.localeCompare(b.title);
  });
}

function JoinButton({
  community,
  viewerId,
  onJoinedChange,
}: {
  community: ForumCommunity;
  viewerId: string;
  onJoinedChange: (communityId: string, joined: boolean) => void;
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const c = dictionary.common;
  const f = dictionary.forum;
  const isOwner = community.created_by === viewerId;
  const [joined, setJoined] = useState(community.joined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  useEffect(() => {
    setJoined(community.joined);
  }, [community.joined]);

  function applyJoin(nextJoined: boolean) {
    if (busy) return;
    void (async () => {
      const prev = joined;
      setBusy(true);
      setJoined(nextJoined);
      onJoinedChange(community.id, nextJoined);
      setError("");
      try {
        const res = await toggleJoinCommunityAction(community.id, prev);
        if (res?.error) {
          setJoined(prev);
          onJoinedChange(community.id, prev);
          setError(res.error);
          return;
        }
        setLeaveConfirmOpen(false);
        invalidateSidebarCommunitiesCache();
        router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  }

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOwner || busy) return;
    if (joined) {
      setLeaveConfirmOpen(true);
      return;
    }
    applyJoin(true);
  }

  if (isOwner && joined) {
    return (
      <div className="shrink-0">
        <span
          className="inline-block rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-600"
          title={f.leaveCommunityAsOwner}
        >
          {c.joined}
        </span>
      </div>
    );
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          joined
            ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
            : "text-white hover:opacity-90"
        }`}
        style={joined ? undefined : { background: "var(--sb-gradient)" }}
      >
        {busy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : null}
        {joined ? c.leave : c.join}
      </button>
      {error ? <p className="mt-1 max-w-[8rem] text-[10px] font-medium leading-tight text-red-600">{error}</p> : null}

      <ConfirmDialog
        open={leaveConfirmOpen}
        title={f.leaveCommunityConfirmTitle}
        description={f.leaveCommunityConfirmDesc}
        confirmLabel={f.leaveCommunity}
        cancelLabel={dictionary.common.cancel}
        danger
        busy={busy}
        busyLabel={c.loading}
        onCancel={() => {
          if (!busy) setLeaveConfirmOpen(false);
        }}
        onConfirm={() => applyJoin(false)}
      />
    </div>
  );
}

function CommunityCard({
  community,
  viewerId,
  onJoinedChange,
}: {
  community: ForumCommunity;
  viewerId: string;
  onJoinedChange: (communityId: string, joined: boolean) => void;
}) {
  return (
    <CommunityDiscoveryCard
      community={community}
      joinControl={
        <JoinButton community={community} viewerId={viewerId} onJoinedChange={onJoinedChange} />
      }
    />
  );
}

function CommunitySection({
  title,
  subtitle,
  communities,
  viewerId,
  initialCount = INITIAL_VISIBLE,
  onJoinedChange,
}: {
  title: string;
  subtitle?: string;
  communities: ForumCommunity[];
  viewerId: string;
  initialCount?: number;
  onJoinedChange: (communityId: string, joined: boolean) => void;
}) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [expanded, setExpanded] = useState(false);
  if (communities.length === 0) return null;

  const visible = expanded ? communities : communities.slice(0, initialCount);
  const canShowMore = communities.length > initialCount;

  return (
    <section>
      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${subtitle ? "mt-3" : "mt-3"}`}>
        {visible.map((community) => (
          <CommunityCard key={community.id} community={community} viewerId={viewerId} onJoinedChange={onJoinedChange} />
        ))}
      </div>
      {canShowMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            {expanded ? f.showLess : f.showMore}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default function CommunitiesDiscovery({
  communities: initialCommunities,
  viewerId,
  initialCategory = ALL,
  initialCreateOpen = false,
}: CommunitiesDiscoveryProps) {
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [createTopics, setCreateTopics] = useState<string[]>([]);
  const [communities, setCommunities] = useState(initialCommunities);

  useEffect(() => {
    setCommunities(initialCommunities);
  }, [initialCommunities]);

  function onJoinedChange(communityId: string, joined: boolean) {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        const delta = joined ? 1 : -1;
        return {
          ...c,
          joined,
          member_count: Math.max(0, c.member_count + delta),
        };
      })
    );
  }

  function openCreate(withTopic?: string) {
    setCreateTopics(withTopic ? [withTopic] : []);
    setCreateOpen(true);
  }

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of communities) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, [communities]);

  const categoryChips = useMemo(() => {
    const known = new Set<string>(COMMUNITY_CATEGORIES);
    const extras = [
      ...new Set(
        communities
          .map((c) => c.category)
          .filter((c) => c && !known.has(c) && !(COMMUNITY_TOPICS as readonly string[]).includes(c))
      ),
    ].sort((a, b) => a.localeCompare(b));
    const withCommunities = COMMUNITY_TOPICS.filter((t) => (countsByCategory[t] ?? 0) > 0);
    const without = COMMUNITY_TOPICS.filter((t) => (countsByCategory[t] ?? 0) === 0);
    return [ALL, ...withCommunities, ...without, ...extras];
  }, [communities, countsByCategory]);

  // Free-text search across name, description, and category — takes priority over the
  // category tabs below so it always searches the full set of communities, not just
  // whichever tab happens to be selected.
  // Free-text search — matches on the community NAME only, so searching
  // "General" finds the community literally named General, not every
  // community that happens to share its category or mention the word
  // somewhere in a description.
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    function matchRank(c: ForumCommunity): number {
      const title = c.title.toLowerCase();
      if (title === q) return 0; // exact name match
      if (title.startsWith(q)) return 1; // name starts with query
      if (title.includes(q)) return 2; // name contains query
      return -1; // no match — not shown
    }

    return communities
      .map((c) => ({ c, rank: matchRank(c) }))
      .filter((x) => x.rank !== -1)
      .sort((a, b) => a.rank - b.rank || a.c.title.localeCompare(b.c.title))
      .map((x) => x.c);
  }, [communities, query]);

  // When a specific category is selected, keep it simple: one section, sorted by activity.
  const categoryFiltered = useMemo(() => {
    if (category === ALL) return [];
    return sortByActivity(communities.filter((c) => c.category === category));
  }, [communities, category]);

  // On "All": Trending → Popular → The rest.
  const trending = useMemo(() => {
    if (category !== ALL) return [];
    return sortByTrending(communities).slice(0, 6);
  }, [communities, category]);

  const popular = useMemo(() => {
    if (category !== ALL) return [];

    const trendingIds = new Set(trending.map((c) => c.id));

    return sortByPopular(communities.filter((c) => !trendingIds.has(c.id))).slice(0, 6);
  }, [communities, category, trending]);

  const rest = useMemo(() => {
    if (category !== ALL) return [];

    const shown = new Set([...trending.map((c) => c.id), ...popular.map((c) => c.id)]);

    return sortByActivity(communities.filter((c) => !shown.has(c.id)));
  }, [communities, category, trending, popular]);

  const categoryDisplay = categoryLabel(locale, category);

  return (
    <div className="space-y-8">
      <div className="relative w-full rounded-full bg-white transition" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--sb-muted)" }}
        />
        <input
          type="text"
          id="discover-communities-search"
          name="discover-communities-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={f.searchCommunitiesPlaceholder}
          className="w-full rounded-full border-none bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
          style={{ color: "var(--sb-ink)" }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={f.categoriesAria}
        >
          {categoryChips.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={(e) => {
                  setCategory(cat);
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {categoryLabel(locale, cat)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => openCreate(category !== ALL ? category : undefined)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          <Plus size={16} strokeWidth={2.5} />
          {f.createCommunity}
        </button>
      </div>

      {searchResults !== null ? (
        searchResults.length > 0 ? (
          <CommunitySection
            title={interpolate(f.searchResultsFor, { query: query.trim() })}
            communities={searchResults}
            viewerId={viewerId}
            initialCount={9}
            onJoinedChange={onJoinedChange}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">{f.noFilterMatch}</p>
            <p className="mt-1 text-sm text-slate-500">{f.tryDifferentFilter}</p>
          </div>
        )
      ) : category !== ALL ? (
        categoryFiltered.length > 0 ? (
          <CommunitySection
            title={categoryDisplay}
            communities={categoryFiltered}
            viewerId={viewerId}
            onJoinedChange={onJoinedChange}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {interpolate(f.noCommunitiesIn, { category: categoryDisplay })}
            </p>
            <p className="mt-1 text-sm text-slate-500">{f.beFirst}</p>
            <button
              type="button"
              onClick={() => openCreate(category)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} strokeWidth={2.5} />
              {interpolate(f.createCommunityIn, { category: categoryDisplay })}
            </button>
          </div>
        )
      ) : communities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">{f.noCommunities}</p>
          <p className="mt-1 text-sm text-slate-500">{f.beFirst}</p>
          <button
            type="button"
            onClick={() => openCreate()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={16} strokeWidth={2.5} />
            {f.createCommunity}
          </button>
        </div>
      ) : (
        <>
          <CommunitySection
            title={f.trending}
            communities={trending}
            viewerId={viewerId}
            onJoinedChange={onJoinedChange}
          />

          <CommunitySection
            title={f.popular}
            communities={popular}
            viewerId={viewerId}
            onJoinedChange={onJoinedChange}
          />

          <CommunitySection
            title={f.moreCommunities}
            communities={rest}
            viewerId={viewerId}
            initialCount={3}
            onJoinedChange={onJoinedChange}
          />
        </>
      )}

      {createOpen ? (
        <CreateCommunityModal
          onClose={() => {
            setCreateOpen(false);
            setCreateTopics([]);
          }}
          initialTopics={createTopics}
        />
      ) : null}
    </div>
  );
}