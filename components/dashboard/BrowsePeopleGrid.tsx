"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, Star, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { DEFAULT_SKILLS } from "@/lib/defaultSkills";

const ALL_SKILL_CATEGORIES = [...new Set(DEFAULT_SKILLS.map((s) => s.category))].sort((a, b) =>
  a.localeCompare(b)
);

type Person = {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  tags: string[];
  categories: string[];
};

type SortOption = "rating" | "reviews" | "name";

const ALL = "__all__";

const AVATAR_TINTS = [
  { bg: "var(--sb-tint-rose-bg)", ink: "var(--sb-tint-rose-ink)" },
  { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  { bg: "var(--sb-tint-blue-bg)", ink: "var(--sb-tint-blue-ink)" },
  { bg: "var(--sb-tint-violet-bg)", ink: "var(--sb-tint-violet-ink)" },
  { bg: "var(--sb-tint-amber-bg)", ink: "var(--sb-tint-amber-ink)" },
];

export default function BrowsePeopleGrid() {
  const { dictionary } = useLocale();
  const b = dictionary.browse;
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadPeople() {
      try {
        const res = await fetch("/api/users/browse");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load people");
        }
        setPeople(data.people ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPeople();
  }, []);

  const categoryOptions = useMemo(() => [ALL, ...ALL_SKILL_CATEGORIES], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const results = people.filter((p) => {
      const matchesCategory = category === ALL || p.categories.includes(category);
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });

    return results.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return a.name.localeCompare(b.name);
    });
  }, [people, query, category, sortBy]);

  return (
    <div className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          ref={filterRef}
          className="relative min-w-0 flex-1 rounded-full bg-white transition"
          style={{ boxShadow: "var(--sb-shadow-sm)" }}
        >
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--sb-muted)" }} />
          <input
            type="text"
            id="browse-people-search"
            name="browse-people-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={b.searchPlaceholder}
            className="w-full rounded-full border-none bg-transparent py-3 pl-10 pr-11 text-sm outline-none"
            style={{ color: "var(--sb-ink)" }}
          />
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            aria-label={b.allCategories}
            aria-expanded={filterOpen}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <Filter size={16} className={category !== ALL ? "text-slate-900" : "text-slate-400"} />
          </button>

          {filterOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 max-h-80 w-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg">
              {categoryOptions.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setFilterOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      active ? "bg-slate-100 font-semibold" : "font-medium hover:bg-slate-50"
                    }`}
                    style={{ color: "var(--sb-ink)" }}
                  >
                    {c === ALL ? b.allCategories : c}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="browse-people-sort"
            name="browse-people-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="min-w-[9.5rem] flex-1 rounded-full border-none bg-white px-4 py-3 text-sm font-bold sm:flex-none sm:w-48"
            style={{ color: "var(--sb-ink)", boxShadow: "var(--sb-shadow-sm)" }}
          >
            <option value="rating">{b.highestRated}</option>
            <option value="reviews">{b.mostReviews}</option>
            <option value="name">{b.nameAZ}</option>
          </select>
        </div>
      </div>

      {category !== ALL ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-3.5 pr-2 text-sm font-semibold text-slate-700">
            {category}
            <button
              type="button"
              onClick={() => setCategory(ALL)}
              aria-label={dictionary.common.remove}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-200"
            >
              <X size={12} />
            </button>
          </span>
        </div>
      ) : null}

      {loading && <p className="mt-6 text-sm" style={{ color: "var(--sb-muted)" }}>{b.loadingPeople}</p>}
      {!loading && error && <p className="mt-6 text-sm text-red-500">{b.loadFailed}</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--sb-muted)" }}>
            {interpolate(filtered.length === 1 ? b.personFound : b.peopleFound, { n: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <div className="nb-card mt-4 p-10 text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>{b.noMatches}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>{b.noMatchesHint}</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => {
                const tags = p.tags.slice(0, 2);
                const avatarTint = AVATAR_TINTS[i % AVATAR_TINTS.length];
                return (
                  <article
                    key={p.id}
                    className="flex h-full flex-col rounded-2xl bg-white p-5 transition hover:-translate-y-1"
                    style={{ boxShadow: "var(--sb-shadow-sm)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        {p.avatarUrl && <AvatarImage src={p.avatarUrl} alt="" />}
                        <AvatarFallback
                          className="text-sm font-extrabold"
                          style={{ background: avatarTint.bg, color: avatarTint.ink }}
                        >
                          {getInitials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold" style={{ color: "var(--sb-ink)" }} title={p.name}>
                          {p.name}
                        </p>
                        {p.slug ? (
                          <p className="truncate text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                            @{p.slug}
                          </p>
                        ) : null}
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                          <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                          <span className="truncate">
                            {p.rating > 0
                              ? `${p.rating.toFixed(1)} (${p.reviewCount})`
                              : b.noRatingsYet}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex min-h-[2.25rem] items-start">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap content-start gap-1.5">
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="w-fit shrink-0 rounded-full text-xs font-bold"
                              style={{ background: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)", padding: "5px 12px" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: "var(--sb-muted)" }}>{b.noSkillsListed}</span>
                      )}
                    </div>

                    <a
                      href={`/dashboard/profile/${p.slug}`}
                      className="btn-outline mt-auto w-full rounded-xl border py-2.5 text-center text-sm font-bold transition"
                      style={{ borderColor: "#e5e7eb", color: "var(--sb-ink)" }}
                    >
                      {b.viewProfile}
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
