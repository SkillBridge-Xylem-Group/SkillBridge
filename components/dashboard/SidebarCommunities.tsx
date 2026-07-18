"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Plus, Settings, Star } from "lucide-react";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import CommunityAvatar from "@/components/forum/CommunityAvatar";

type SidebarCommunitiesProps = {
  communities: SidebarCommunity[];
  onNavigate?: () => void;
};

const FAVORITES_KEY = "sb-community-favorites";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function saveFavorites(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function CommunityRow({
  community,
  active,
  favorited,
  onNavigate,
  onToggleFavorite,
}: {
  community: SidebarCommunity;
  active: boolean;
  favorited: boolean;
  onNavigate?: () => void;
  onToggleFavorite: () => void;
}) {
  const href = `/dashboard/forum/c/${community.slug}`;

  return (
    <div
      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
        active ? "bg-slate-100 text-slate-900" : "text-slate-800 hover:bg-slate-50"
      }`}
    >
      <Link href={href} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2.5">
        <CommunityAvatar
          title={community.title}
          imageUrl={community.image_url}
          accentColor={community.accent_color}
          size="sm"
        />
        <span className="min-w-0 flex-1 truncate text-sm">r/{community.slug}</span>
      </Link>
      <button
        type="button"
        aria-label={favorited ? "Unfavorite" : "Favorite"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`shrink-0 rounded p-0.5 transition ${
          favorited ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
        }`}
      >
        <Star size={14} className={favorited ? "fill-amber-400" : ""} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default function SidebarCommunities({ communities, onNavigate }: SidebarCommunitiesProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return next;
    });
  }

  // Reddit-style: one list of communities you belong to (created + joined).
  const list = [...communities].sort((a, b) => {
    const aFav = favorites.has(a.id) ? 0 : 1;
    const bFav = favorites.has(b.id) ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    return a.slug.localeCompare(b.slug);
  });

  return (
    <div className="mt-6 border-t border-slate-100 pt-4">
      <div className="mb-0.5 flex items-center gap-1 px-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between rounded-md px-1 py-1.5 text-left hover:bg-slate-50"
          aria-expanded={open}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Communities
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        <Link
          href="/dashboard/forum?create=1"
          onClick={onNavigate}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Create community"
          title="Create community"
        >
          <Plus size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {open ? (
        <div className="px-1">
          <Link
            href="/dashboard/forum"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Settings size={16} className="shrink-0 text-slate-500" strokeWidth={1.75} />
            <span>Manage Communities</span>
          </Link>

          {list.length > 0 ? (
            <nav className="mt-0.5 space-y-0.5">
              {list.map((c) => {
                const href = `/dashboard/forum/c/${c.slug}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <CommunityRow
                    key={c.id}
                    community={c}
                    active={active}
                    favorited={favorites.has(c.id)}
                    onNavigate={onNavigate}
                    onToggleFavorite={() => toggleFavorite(c.id)}
                  />
                );
              })}
            </nav>
          ) : (
            <p className="px-2 py-2 text-xs leading-relaxed text-slate-400">
              Join communities from the Forum — they will show up here.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
