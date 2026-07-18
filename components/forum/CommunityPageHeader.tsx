"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Cake, Camera, Globe2, MoreHorizontal, Plus } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import {
  COMMUNITY_ACCENT_COLORS,
  communityAccentHex,
  normalizeCommunityAccent,
} from "@/lib/forumCommunities";
import { formatAppDate } from "@/lib/i18n/locales";
import {
  toggleJoinCommunityAction,
  updateCommunityAccentAction,
  updateCommunityImageAction,
} from "@/lib/actions/forum";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import { useLocale } from "@/components/i18n/LocaleProvider";
import CommunityAvatar from "@/components/forum/CommunityAvatar";

type CommunityPageHeaderProps = {
  community: ForumCommunity;
  isOwner?: boolean;
};

export default function CommunityPageHeader({ community, isOwner = false }: CommunityPageHeaderProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [joined, setJoined] = useState(community.joined || isOwner);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [accent, setAccent] = useState(normalizeCommunityAccent(community.accent_color));
  const accentHex = communityAccentHex(accent);

  useEffect(() => {
    setAccent(normalizeCommunityAccent(community.accent_color));
  }, [community.accent_color]);

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
      router.refresh();
    });
  }

  function onPickAccent(next: string) {
    if (!isOwner) return;
    const prev = accent;
    setAccent(normalizeCommunityAccent(next));
    startTransition(async () => {
      setError("");
      const res = await updateCommunityAccentAction(community.id, next);
      if (res?.error) {
        setAccent(prev);
        setError(res.error);
        return;
      }
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className="relative h-20 sm:h-24"
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
                    {community.category}
                  </span>
                ) : null}
              </div>
              {community.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{community.description}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Cake size={13} className="text-slate-400" aria-hidden />
                  Created {formatAppDate(community.created_at, locale)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe2 size={13} className="text-slate-400" aria-hidden />
                  Public
                </span>
                <span>
                  {community.member_count.toLocaleString()}{" "}
                  {community.member_count === 1 ? "member" : "members"}
                  {" · "}
                  {community.post_count} {community.post_count === 1 ? "post" : "posts"}
                </span>
              </div>
              {isOwner ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Color</span>
                  {COMMUNITY_ACCENT_COLORS.map((color) => {
                    const selected = accent === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        disabled={pending}
                        onClick={() => onPickAccent(color.id)}
                        aria-label={`Set color ${color.id}`}
                        aria-pressed={selected}
                        style={{ backgroundColor: color.hex }}
                        className={`h-6 w-6 rounded-full transition disabled:opacity-60 ${
                          selected ? "ring-2 ring-offset-1 ring-slate-900 scale-110" : "ring-1 ring-black/10"
                        }`}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/forum/c/${community.slug}?compose=1`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Post
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
                  {joined ? "Joined" : "Join"}
                </button>
              ) : (
                <span className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-bold text-slate-600">
                  Joined
                </span>
              )}
              <Link
                href="/dashboard/forum"
                aria-label="All communities"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
                title="All communities"
              >
                <MoreHorizontal size={16} />
              </Link>
            </div>
          </div>
          {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
