"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { COMMUNITY_CATEGORIES, COMMUNITY_TOPICS } from "@/lib/forumCommunities";
import { toggleJoinCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import CreateCommunityModal from "@/components/forum/CreateCommunityModal";
import CommunityAvatar from "@/components/forum/CommunityAvatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";

type CommunitiesDiscoveryProps = {
  communities: ForumCommunity[];
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

function JoinButton({
  community,
  onJoinedChange,
}: {
  community: ForumCommunity;
  onJoinedChange: (communityId: string, joined: boolean) => void;
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const c = dictionary.common;
  const [joined, setJoined] = useState(community.joined);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    setJoined(community.joined);
  }, [community.joined]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const prev = joined;
      const next = !prev;
      setJoined(next);
      onJoinedChange(community.id, next);
      setError("");
      const res = await toggleJoinCommunityAction(community.id, prev);
      if (res?.error) {
        setJoined(prev);
        onJoinedChange(community.id, prev);
        setError(res.error);
        return;
      }
      invalidateSidebarCommunitiesCache();
      router.refresh();
    });
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-full px-4 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          joined
            ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
        }`}
      >
        {joined ? c.joined : c.join}
      </button>
      {error ? <p className="mt-1 max-w-[8rem] text-[10px] font-medium leading-tight text-red-600">{error}</p> : null}
    </div>
  );
}

function CommunityCard({
  community,
  onJoinedChange,
}: {
  community: ForumCommunity;
  onJoinedChange: (communityId: string, joined: boolean) => void;
}) {
  const { dictionary } = useLocale();
  const c = dictionary.common;
  const f = dictionary.forum;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:bg-slate-50/50">
      <div className="flex items-start gap-3">
        <Link href={`/dashboard/forum/c/${community.slug}`} className="shrink-0">
          <CommunityAvatar
            title={community.title}
            imageUrl={community.image_url}
            accentColor={community.accent_color}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/dashboard/forum/c/${community.slug}`} className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 hover:underline">{community.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {community.member_count.toLocaleString()}{" "}
                {community.member_count === 1 ? c.member : c.members}
                {" · "}
                {community.post_count} {community.post_count === 1 ? f.post : f.posts}
              </p>
            </Link>
            <JoinButton community={community} onJoinedChange={onJoinedChange} />
          </div>
        </div>
      </div>
      {community.description ? (
        <Link href={`/dashboard/forum/c/${community.slug}`} className="mt-2.5 block">
          <p className="line-clamp-2 text-sm leading-snug text-slate-600">{community.description}</p>
        </Link>
      ) : null}
    </div>
  );
}

function CommunitySection({
  title,
  communities,
  initialCount = INITIAL_VISIBLE,
  onJoinedChange,
}: {
  title: string;
  communities: ForumCommunity[];
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
      <h2 className="mb-3 text-lg font-extrabold text-slate-900">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((community) => (
          <CommunityCard key={community.id} community={community} onJoinedChange={onJoinedChange} />
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
  initialCategory = ALL,
  initialCreateOpen = false,
}: CommunitiesDiscoveryProps) {
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const [category, setCategory] = useState(initialCategory);
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

  const recommended = useMemo(() => {
    const pool =
      category === ALL ? communities : communities.filter((c) => c.category === category);
    return sortByActivity(pool);
  }, [communities, category]);

  const topicSections = useMemo(() => {
    if (category !== ALL) return [];
    const recommendedIds = new Set(recommended.slice(0, INITIAL_VISIBLE).map((c) => c.id));
    const byCat = new Map<string, ForumCommunity[]>();
    for (const c of communities) {
      if (!c.category || c.category === "General") continue;
      if (recommendedIds.has(c.id)) continue;
      const list = byCat.get(c.category) ?? [];
      list.push(c);
      byCat.set(c.category, list);
    }
    return [...byCat.entries()]
      .map(([cat, list]) => ({
        category: cat,
        title: interpolate(f.moreLike, { category: categoryLabel(locale, cat) }),
        communities: sortByActivity(list),
      }))
      .filter((s) => s.communities.length > 0)
      .sort((a, b) => b.communities.length - a.communities.length)
      .slice(0, 4);
  }, [communities, category, recommended, f.moreLike, locale]);

  const categoryDisplay = categoryLabel(locale, category);

  return (
    <div className="space-y-8">
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
                onClick={() => setCategory(cat)}
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

      {recommended.length > 0 ? (
        <CommunitySection
          title={category === ALL ? f.recommended : categoryDisplay}
          communities={recommended}
          onJoinedChange={onJoinedChange}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {category === ALL
              ? f.noCommunities
              : interpolate(f.noCommunitiesIn, { category: categoryDisplay })}
          </p>
          <p className="mt-1 text-sm text-slate-500">{f.beFirst}</p>
          <button
            type="button"
            onClick={() => openCreate(category !== ALL ? category : undefined)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={16} strokeWidth={2.5} />
            {category === ALL
              ? f.createCommunity
              : interpolate(f.createCommunityIn, { category: categoryDisplay })}
          </button>
        </div>
      )}

      {topicSections.map((section) => (
        <CommunitySection
          key={section.category}
          title={section.title}
          communities={section.communities}
          initialCount={3}
          onJoinedChange={onJoinedChange}
        />
      ))}

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
