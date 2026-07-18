"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import type { SidebarCommunity } from "@/lib/forumCommunities";
import CommunityAvatar from "@/components/forum/CommunityAvatar";

type SidebarCommunitiesProps = {
  communities: SidebarCommunity[];
  onNavigate?: () => void;
};

function CommunityRow({
  community,
  active,
  onNavigate,
}: {
  community: SidebarCommunity;
  active: boolean;
  onNavigate?: () => void;
}) {
  const href = `/dashboard/forum/c/${community.slug}`;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition ${
        active ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <CommunityAvatar
        title={community.title}
        imageUrl={community.image_url}
        accentColor={community.accent_color}
        size="sm"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{community.title}</span>
    </Link>
  );
}

export default function SidebarCommunities({ communities, onNavigate }: SidebarCommunitiesProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const created = communities
    .filter((c) => c.isOwner)
    .sort((a, b) => a.title.localeCompare(b.title));
  const joined = communities
    .filter((c) => !c.isOwner)
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="mt-6 border-t border-slate-100 pt-4">
      <div className="mb-1 flex items-center gap-1 px-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-slate-50"
          aria-expanded={open}
        >
          <ChevronDown
            size={14}
            className={`shrink-0 text-slate-400 transition ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Communities
          </span>
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
        <div className="space-y-3 px-1">
          {created.length > 0 ? (
            <div>
              <p className="mb-0.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Created by you
              </p>
              <nav className="space-y-0.5">
                {created.map((c) => {
                  const href = `/dashboard/forum/c/${c.slug}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <CommunityRow
                      key={c.id}
                      community={c}
                      active={active}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </nav>
            </div>
          ) : null}

          {joined.length > 0 ? (
            <div>
              <p className="mb-0.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Joined
              </p>
              <nav className="space-y-0.5">
                {joined.map((c) => {
                  const href = `/dashboard/forum/c/${c.slug}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <CommunityRow
                      key={c.id}
                      community={c}
                      active={active}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </nav>
            </div>
          ) : null}

          {communities.length === 0 ? (
            <p className="px-2 text-xs leading-relaxed text-slate-400">
              Join or create a community — it will show up here.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
