"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, SlidersHorizontal } from "lucide-react";
import { getInitials } from "@/lib/utils";

type Person = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  categories: string[];
};

type SortOption = "rating" | "reviews" | "name";

export default function BrowsePeopleGrid() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  useEffect(() => {
    async function loadPeople() {
      try {
        const res = await fetch("/api/users/browse");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load people");
        }
        setPeople(data.people ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load people");
      } finally {
        setLoading(false);
      }
    }
    loadPeople();
  }, []);

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    people.forEach((p) => p.categories.forEach((c) => unique.add(c)));
    return ["All Categories", ...Array.from(unique).sort()];
  }, [people]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const results = people.filter((p) => {
      const matchesCategory = category === "All Categories" || p.categories.includes(category);
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
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full rounded-full border border-slate-200 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-brand/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-brand/50"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-brand/50"
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading people...</p>}
      {!loading && error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "person" : "people"} found
          </p>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-600">No matches yet</p>
              <p className="mt-1 text-sm text-slate-400">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const tags = p.tags.slice(0, 2);
                return (
                  <article
                    key={p.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900" title={p.name}>
                          {p.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                          <span className="truncate">
                            {p.rating > 0
                              ? `${p.rating.toFixed(1)} (${p.reviewCount})`
                              : "No ratings yet"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex min-h-[4.75rem] flex-col justify-start gap-2">
                      {tags.length > 0 ? (
                        tags.map((t) => (
                          <span
                            key={t}
                            title={t}
                            className="inline-block max-w-full truncate rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No skills listed</span>
                      )}
                    </div>

                    <a
                      href={`/dashboard/profile/${p.slug}`}
                      className="mt-auto inline-flex w-full items-center justify-center rounded-full border-2 border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand/40 hover:text-brand"
                    >
                      View Profile
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
