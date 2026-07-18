"use client";
import { useEffect, useState } from "react";
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
    <div className="nb-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold nb-heading">People You May Want to Connect With</h2>
        <a
          href="/dashboard/browse-people"
          className="shrink-0 text-sm font-bold hover:underline"
          style={{ color: "var(--neu-indigo)" }}
        >
          View all
        </a>
      </div>
      {loading && <p className="mt-5 text-sm" style={{ color: "var(--neu-text-muted)" }}>Loading...</p>}
      {!loading && error && <p className="mt-5 text-sm text-red-500">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="mt-5 text-sm" style={{ color: "var(--neu-text-muted)" }}>
          No matches yet - add skills you want to learn on your profile to see people who can help.
        </p>
      )}
      {!loading && !error && matches.length > 0 && (
        <div className="mt-6 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-3">
          {matches.map((m) => {
            const tags = m.tags.slice(0, 3);
            const tagColors = ["var(--neu-yellow)", "var(--neu-teal)", "var(--neu-coral)", "var(--neu-purple)", "var(--neu-orange)"];
            return (
              <article
                key={m.id}
                className="flex h-full flex-col rounded-2xl p-5"
                style={{ background: "#fbfaff", border: "2.5px solid var(--neu-ink)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="nb-avatar h-12 w-12 text-sm" style={{ background: "var(--neu-indigo)" }}>
                    {getInitials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-bold"
                      style={{ color: "var(--neu-ink)" }}
                      title={m.name}
                    >
                      {m.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--neu-text-muted)" }}>
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
                  href={`/dashboard/profile/${m.slug}`}
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
    </div>
  );
}
