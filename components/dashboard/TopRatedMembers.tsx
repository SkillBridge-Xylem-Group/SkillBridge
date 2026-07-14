"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

type Match = {
  id: string;
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">People You May Want to Connect With</h2>
        <a href="/dashboard/browse-people" className="text-sm font-bold text-brand hover:underline">
          View all
        </a>
      </div>
      {loading && <p className="mt-5 text-sm text-slate-500">Loading...</p>}
      {!loading && error && <p className="mt-5 text-sm text-red-500">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="mt-5 text-sm text-slate-500">
          No matches yet - add skills you want to learn on your profile to see people who can help.
        </p>
      )}
      {!loading && !error && matches.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {matches.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                  {getInitials(m.name)}
                </div>
                <p className="text-sm font-bold text-slate-900">{m.name}</p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {m.rating > 0 ? `${m.rating.toFixed(1)} (${m.reviewCount})` : "No ratings yet"}
              </div>
              {m.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <a
                href={`/dashboard/profile/${m.id}`}
                className="btn-pill mt-4 block border-2 border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-brand/40 hover:text-brand"
              >
                View Profile
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
