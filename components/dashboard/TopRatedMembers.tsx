"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

type Match = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  tags: string[];
};

export default function TopRatedMembers() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/users/matches");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load matches");
        }
        setMatches(data.matches ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold text-slate-900">People You May Want to Connect With</h2>
        <Link
          href="/dashboard/browse-people"
          className="shrink-0 text-sm font-bold text-brand hover:underline"
        >
          View all
        </Link>
      </div>
      {loading && <p className="mt-5 text-sm text-slate-500">Loading...</p>}
      {!loading && error && <p className="mt-5 text-sm text-red-500">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="mt-5 text-sm text-slate-500">
          No matches yet - add skills you want to learn on your profile to see people who can help.
        </p>
      )}
      {!loading && !error && matches.length > 0 && (
        <div className="mt-6 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-3">
          {matches.map((m) => {
            const tags = m.tags.slice(0, 3);
            return (
              <article
                key={m.id}
                className="flex h-full flex-col rounded-2xl border border-slate-100 bg-[#FAFBFF] p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                    {getInitials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-bold text-slate-900"
                      title={m.name}
                    >
                      {m.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                      <span className="truncate">
                        {m.rating > 0
                          ? `${m.rating.toFixed(1)} (${m.reviewCount})`
                          : "No ratings yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fixed-height tag slot so every card's button lines up */}
                <div className="mt-5 flex min-h-[3.5rem] items-start">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap content-start gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="w-fit shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">No skills listed</span>
                  )}
                </div>

                <Link
                  href={`/dashboard/profile/${m.slug}`}
                  className="mt-auto inline-flex w-fit self-center items-center justify-center rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand/40 hover:text-brand"
                >
                  View Profile
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
