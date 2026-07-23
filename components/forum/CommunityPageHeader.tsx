"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Cake, Globe2, Loader2, LogOut, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { communityAccentHex, normalizeCommunityAccent } from "@/lib/forumCommunities";
import { formatAppDate } from "@/lib/i18n/locales";
import { deleteCommunityAction, toggleJoinCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";
import CommunityAvatar from "@/components/forum/CommunityAvatar";
import EditCommunityModal from "@/components/forum/EditCommunityModal";
import { openForumCompose } from "@/components/forum/QuestionComposer";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { interpolate } from "@/lib/i18n/interpolate";

type CommunityPageHeaderProps = {
  community: ForumCommunity;
  isOwner?: boolean;
};

export default function CommunityPageHeader({ community, isOwner = false }: CommunityPageHeaderProps) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const c = dictionary.common;
  const f = dictionary.forum;
  const menuRef = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(community.joined || isOwner);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [accent, setAccent] = useState(normalizeCommunityAccent(community.accent_color));
  const accentHex = communityAccentHex(accent);
  const canDelete = isOwner && !community.is_official && !community.id.startsWith("static-");
  const canLeave = !isOwner && joined;

  useEffect(() => {
    setAccent(normalizeCommunityAccent(community.accent_color));
  }, [community.accent_color]);

  useEffect(() => {
    setJoined(community.joined || isOwner);
  }, [community.joined, isOwner]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function requestLeave() {
    if (!canLeave || busy) return;
    setMenuOpen(false);
    setLeaveConfirmOpen(true);
  }

  function confirmLeave() {
    if (!canLeave || busy) return;
    void (async () => {
      const prev = joined;
      setBusy(true);
      setJoined(false);
      setError("");
      try {
        const res = await toggleJoinCommunityAction(community.id, true);
        if (res?.error) {
          setJoined(prev);
          setError(res.error);
          return;
        }
        setLeaveConfirmOpen(false);
        invalidateSidebarCommunitiesCache();
        router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  }

  function joinCommunity() {
    if (isOwner || joined || busy) return;
    void (async () => {
      setBusy(true);
      setJoined(true);
      setError("");
      try {
        const res = await toggleJoinCommunityAction(community.id, false);
        if (res?.error) {
          setJoined(false);
          setError(res.error);
          return;
        }
        invalidateSidebarCommunitiesCache();
        router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  }

  function requestDelete() {
    if (!canDelete || busy) return;
    setMenuOpen(false);
    setDeleteConfirmOpen(true);
  }

  function confirmDelete() {
    if (!canDelete || busy) return;
    void (async () => {
      setBusy(true);
      setError("");
      try {
        const res = await deleteCommunityAction(community.id);
        if (res?.error) {
          setError(res.error);
          return;
        }
        setDeleteConfirmOpen(false);
        invalidateSidebarCommunitiesCache();
        router.push("/dashboard/forum");
        router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-[5/1] w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {community.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.banner_url}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accentHex} 88%, white) 0%, color-mix(in srgb, ${accentHex} 45%, #14b8a6) 100%)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 40%, white 0 2px, transparent 3px),
              radial-gradient(circle at 70% 60%, white 0 1.5px, transparent 2.5px)`,
                backgroundSize: "48px 48px, 36px 36px",
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-3 px-4 pb-4 pt-0 sm:gap-4 sm:px-5">
        <div className="relative z-10 -mt-8 shrink-0 sm:-mt-9">
          <CommunityAvatar
            title={community.title}
            imageUrl={community.image_url}
            accentColor={accent}
            size="xl"
            contrast
          />
        </div>

        <div className="min-w-0 flex-1 pt-2">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {community.title}
                </h1>
                {community.category ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {categoryLabel(locale, community.category)}
                  </span>
                ) : null}
              </div>
              {community.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{community.description}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Cake size={13} className="text-slate-400" aria-hidden />
                  {c.created} {formatAppDate(community.created_at, locale)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe2 size={13} className="text-slate-400" aria-hidden />
                  {c.public}
                </span>
                <span>
                  {community.member_count.toLocaleString()}{" "}
                  {community.member_count === 1 ? c.member : c.members}
                  {" · "}
                  {community.post_count} {community.post_count === 1 ? f.post : f.posts}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  openForumCompose(`/dashboard/forum/c/${community.slug}?compose=1`);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <Plus size={16} strokeWidth={2.5} />
                {f.createPost}
              </button>
              {isOwner ? (
                <span className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-bold text-slate-600">
                  {c.joined}
                </span>
              ) : joined ? (
                <button
                  type="button"
                  onClick={requestLeave}
                  disabled={busy}
                  aria-busy={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-1.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                  {c.leave}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={joinCommunity}
                  disabled={busy}
                  aria-busy={busy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: accentHex }}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                  {c.join}
                </button>
              )}
              <div className="relative z-30" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Community options"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={16} />}
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-1.5 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {isOwner ? (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={() => {
                          setMenuOpen(false);
                          setEditOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Pencil size={14} />
                        {f.editCommunity}
                      </button>
                    ) : null}
                    {canLeave ? (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={requestLeave}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                        {f.leaveCommunity}
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={requestDelete}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        {f.deleteCommunity}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
        </div>
      </div>

      <ConfirmDialog
        open={leaveConfirmOpen}
        title={f.leaveCommunityConfirmTitle}
        description={f.leaveCommunityConfirmDesc}
        confirmLabel={f.leaveCommunity}
        cancelLabel={dictionary.common.cancel}
        danger
        busy={busy}
        busyLabel={c.loading}
        onCancel={() => {
          if (!busy) setLeaveConfirmOpen(false);
        }}
        onConfirm={confirmLeave}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={f.deleteCommunityConfirmTitle}
        description={interpolate(f.deleteCommunityConfirmDesc, { slug: community.slug })}
        confirmLabel={f.deleteCommunity}
        cancelLabel={dictionary.common.cancel}
        danger
        busy={busy}
        busyLabel={c.loading}
        onCancel={() => {
          if (!busy) setDeleteConfirmOpen(false);
        }}
        onConfirm={confirmDelete}
      />

      {editOpen ? (
        <EditCommunityModal
          community={community}
          onClose={() => {
            if (!busy) setEditOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
