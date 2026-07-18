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

const AVATAR_TINTS = [
  { bg: "var(--sb-tint-rose-bg)", ink: "var(--sb-tint-rose-ink)" },
  { bg: "var(--sb-tint-blue-bg)", ink: "var(--sb-tint-blue-ink)" },
  { bg: "var(--sb-tint-amber-bg)", ink: "var(--sb-tint-amber-ink)" },
  { bg: "var(--sb-tint-violet-bg)", ink: "var(--sb-tint-violet-ink)" },
  { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
];
const TAG_TINTS = [
  { bg: "var(--sb-emerald-light)", ink: "var(--sb-emerald-dark)" },
  { bg: "var(--sb-tint-amber-bg)", ink: "var(--sb-tint-amber-ink)" },
  { bg: "var(--sb-teal-light)", ink: "var(--sb-teal-dark)" },
  { bg: "var(--sb-tint-violet-bg)", ink: "var(--sb-tint-violet-ink)" },
];

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
        <h2 className="text-lg font-extrabold nb-heading">Suggested People</h2>
        <a
          href="/dashboard/browse-people"
          className="shrink-0 text-sm font-bold hover:underline"
          style={{ color: "var(--sb-teal-dark)" }}
        >
          View all
        </a>
      </div>
      {loading && <p className="mt-5 text-sm" style={{ color: "var(--sb-muted)" }}>Loading...</p>}
      {!loading && error && <p className="mt-5 text-sm text-red-500">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="mt-5 text-sm" style={{ color: "var(--sb-muted)" }}>
          No matches yet - add skills you want to learn on your profile to see people who can help.
        </p>
      )}
      {!loading && !error && matches.length > 0 && (
        <div className="mt-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
          {matches.map((m, i) => {
            const tags = m.tags.slice(0, 2);
            const avatarTint = AVATAR_TINTS[i % AVATAR_TINTS.length];
            return (
              <article
                key={m.id}
                className="flex h-full flex-col rounded-2xl p-5 transition hover:-translate-y-1"
                style={{ background: "#fbfffc", boxShadow: "var(--sb-shadow-sm)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold" style={{ background: avatarTint.bg, color: avatarTint.ink }}>
                    {getInitials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-extrabold"
                      style={{ color: "var(--sb-ink)" }}
                      title={m.name}
                    >
                      {m.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
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
                <div className="mt-4 flex min-h-[2.5rem] items-start">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap content-start gap-1.5">
                      {tags.map((t, ti) => {
                        const tint = TAG_TINTS[ti % TAG_TINTS.length];
                        return (
                          <span
                            key={t}
                            className="w-fit shrink-0 rounded-full text-[11px] font-bold"
                            style={{ background: tint.bg, color: tint.ink, padding: "5px 11px" }}
                          >
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs font-medium" style={{ color: "var(--sb-muted)" }}>No skills listed</span>
                  )}
                </div>

                <a
                  href={`/dashboard/profile/${m.slug}`}
                  className="mt-auto block w-full rounded-2xl py-2.5 text-center text-sm font-bold text-white transition hover:-translate-y-0.5"
                  style={{ background: "var(--sb-gradient)" }}
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
