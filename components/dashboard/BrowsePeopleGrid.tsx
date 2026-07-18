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

const AVATAR_TINTS = [
  { bg: "var(--sb-tint-rose-bg)", ink: "var(--sb-tint-rose-ink)" },
  { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  { bg: "var(--sb-tint-blue-bg)", ink: "var(--sb-tint-blue-ink)" },
  { bg: "var(--sb-tint-violet-bg)", ink: "var(--sb-tint-violet-ink)" },
  { bg: "var(--sb-tint-amber-bg)", ink: "var(--sb-tint-amber-ink)" },
];

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
    <div className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 rounded-full bg-white transition" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--sb-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full rounded-full border-none bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
            style={{ color: "var(--sb-ink)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="nb-icon-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            aria-hidden
          >
            <SlidersHorizontal size={16} />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-[9.5rem] flex-1 rounded-full border-none bg-white px-4 py-3 text-sm font-bold sm:flex-none sm:w-48"
            style={{ color: "var(--sb-ink)", boxShadow: "var(--sb-shadow-sm)" }}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="min-w-[9.5rem] flex-1 rounded-full border-none bg-white px-4 py-3 text-sm font-bold sm:flex-none sm:w-48"
            style={{ color: "var(--sb-ink)", boxShadow: "var(--sb-shadow-sm)" }}
          >
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm" style={{ color: "var(--sb-muted)" }}>Loading people...</p>}
      {!loading && error && <p className="mt-6 text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--sb-muted)" }}>
            {filtered.length} {filtered.length === 1 ? "person" : "people"} found
          </p>

          {filtered.length === 0 ? (
            <div className="nb-card mt-4 p-10 text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>No matches yet</p>
              <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>Try a different search term or category.</p>
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
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                        style={{ background: avatarTint.bg, color: avatarTint.ink }}
                      >
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold" style={{ color: "var(--sb-ink)" }} title={p.name}>
                          {p.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
                          <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                          <span className="truncate">
                            {p.rating > 0
                              ? `${p.rating.toFixed(1)} (${p.reviewCount})`
                              : "No ratings yet"}
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
                        <span className="text-xs font-medium" style={{ color: "var(--sb-muted)" }}>No skills listed</span>
                      )}
                    </div>

                    <a
                      href={`/dashboard/profile/${p.slug}`}
                      className="btn-outline mt-auto w-full rounded-xl border py-2.5 text-center text-sm font-bold transition"
                      style={{ borderColor: "#e5e7eb", color: "var(--sb-ink)" }}
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
