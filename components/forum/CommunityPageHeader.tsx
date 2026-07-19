"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Cake, Camera, Globe2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { communityAccentHex, normalizeCommunityAccent } from "@/lib/forumCommunities";
import { formatAppDate } from "@/lib/i18n/locales";
import {
  deleteCommunityAction,
  toggleJoinCommunityAction,
  updateCommunityImageAction,
} from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";
import CommunityAvatar from "@/components/forum/CommunityAvatar";

type CommunityPageHeaderProps = {
  community: ForumCommunity;
  isOwner?: boolean;
};

export default function CommunityPageHeader({ community, isOwner = false }: CommunityPageHeaderProps) {
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const c = dictionary.common;
  const f = dictionary.forum;
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(community.joined || isOwner);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accent, setAccent] = useState(normalizeCommunityAccent(community.accent_color));
  const accentHex = communityAccentHex(accent);
  const canDelete = isOwner && !community.is_official && !community.id.startsWith("static-");

  useEffect(() => {
    setAccent(normalizeCommunityAccent(community.accent_color));
  }, [community.accent_color]);

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

  function toggleJoin() {
    if (isOwner) return;
    startTransition(async () => {
      const prev = joined;
      setJoined(!prev);
      setError("");
      const res = await toggleJoinCommunityAction(community.id, prev);
      if (res?.error) {
        setJoined(prev);
        setError(res.error);
        return;
      }
      invalidateSidebarCommunitiesCache();
      router.refresh();
    });
  }

  function onDeleteCommunity() {
    if (!canDelete) return;
    const ok = window.confirm(
      `Delete r/${community.slug}? Posts will move to General. This can’t be undone.`
    );
    if (!ok) return;
    setMenuOpen(false);
    startTransition(async () => {
      setError("");
      const res = await deleteCommunityAction(community.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      invalidateSidebarCommunitiesCache();
      router.push("/dashboard/forum");
      router.refresh();
    });
  }

  function onPickAvatar(file: File | undefined) {
    if (!file || !isOwner) return;
    startTransition(async () => {
      setError("");
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      if (file.size > MAX_FORUM_IMAGE_BYTES) {
        setError("Image is too large (max 10MB).");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You need to be signed in.");
        return;
      }
      const uploaded = await uploadForumImage({ userId: user.id, file });
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }
      const res = await updateCommunityImageAction(community.id, uploaded.url);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div
        className="relative h-20 overflow-hidden rounded-t-2xl sm:h-24"
        style={{
          background: `linear-gradient(90deg, ${accentHex}, color-mix(in srgb, ${accentHex} 70%, #0f172a))`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 40%, white 0 2px, transparent 3px),
              radial-gradient(circle at 70% 60%, white 0 1.5px, transparent 2.5px)`,
            backgroundSize: "48px 48px, 36px 36px",
          }}
        />
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
          {isOwner ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  onPickAvatar(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={pending}
                aria-label="Change community icon"
                title="Change community icon"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-slate-50 disabled:opacity-60"
              >
                <Camera size={14} />
              </button>
            </>
          ) : null}
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
              <Link
                href={`/dashboard/forum/c/${community.slug}?compose=1`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <Plus size={16} strokeWidth={2.5} />
                {f.createPost}
              </Link>
              {!isOwner ? (
                <button
                  type="button"
                  onClick={toggleJoin}
                  disabled={pending}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition disabled:opacity-60 ${
                    joined
                      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      : "text-white hover:opacity-90"
                  }`}
                  style={joined ? undefined : { backgroundColor: accentHex }}
                >
                  {joined ? c.joined : c.join}
                </button>
              ) : (
                <span className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-bold text-slate-600">
                  {c.joined}
                </span>
              )}
              <div className="relative z-30" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Community options"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  disabled={pending}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-1.5 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    <Link
                      href="/dashboard/forum"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {f.allCommunities}
                    </Link>
                    {canDelete ? (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={pending}
                        onClick={onDeleteCommunity}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={14} />
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
    </div>
  );
}
