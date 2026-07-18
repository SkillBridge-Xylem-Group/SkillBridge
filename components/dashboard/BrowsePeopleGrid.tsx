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
      <div className="nb-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--neu-text-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="nb-input w-full rounded-full py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="nb-icon-btn flex h-11 w-11 shrink-0 items-center justify-center"
            style={{ color: "var(--neu-text-muted)" }}
            aria-hidden
          >
            <SlidersHorizontal size={16} />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="nb-input min-w-[9.5rem] flex-1 rounded-full px-4 py-2.5 text-sm font-semibold sm:flex-none sm:w-48"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="nb-input min-w-[9.5rem] flex-1 rounded-full px-4 py-2.5 text-sm font-semibold sm:flex-none sm:w-48"
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm" style={{ color: "var(--neu-text-muted)" }}>Loading people...</p>}
      {!loading && error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm" style={{ color: "var(--neu-text-muted)" }}>
            {filtered.length} {filtered.length === 1 ? "person" : "people"} found
          </p>

          {filtered.length === 0 ? (
            <div className="nb-card mt-4 p-10 text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--neu-ink)" }}>No matches yet</p>
              <p className="mt-1 text-sm" style={{ color: "var(--neu-text-muted)" }}>Try a different search term or category.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => {
                const tags = p.tags.slice(0, 3);
                const avatarColors = ["var(--neu-coral)", "var(--neu-indigo)", "var(--neu-teal)", "var(--neu-purple)", "var(--neu-orange)"];
                const tagColors = ["var(--neu-yellow)", "var(--neu-teal)", "var(--neu-coral)", "var(--neu-purple)", "var(--neu-orange)"];
                return (
                  <article key={p.id} className="nb-card flex h-full flex-col p-5">
                    <div className="flex items-center gap-3">
                      <div className="nb-avatar h-12 w-12 text-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold" style={{ color: "var(--neu-ink)" }} title={p.name}>
                          {p.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--neu-text-muted)" }}>
                          <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                          <span className="truncate">
                            {p.rating > 0
                              ? `${p.rating.toFixed(1)} (${p.reviewCount})`
                              : "No ratings yet"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex min-h-[3.5rem] items-start">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap content-start gap-1.5">
                          {tags.map((t, ti) => (
                            <span
                              key={t}
                              className="nb-tag w-fit shrink-0"
                              style={{ background: tagColors[ti % tagColors.length], fontSize: "11px", padding: "4px 10px" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: "var(--neu-text-muted)" }}>No skills listed</span>
                      )}
                    </div>

                    <a
                      href={`/dashboard/profile/${p.slug}`}
                      className="nb-btn mt-auto w-full bg-white py-2 text-sm"
                      style={{ color: "var(--neu-ink)", boxShadow: "none" }}
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
