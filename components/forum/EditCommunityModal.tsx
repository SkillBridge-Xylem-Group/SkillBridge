"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import type { ForumCommunity } from "@/lib/forumCommunities";
import { communityAccentHex } from "@/lib/forumCommunities";
import {
  updateCommunityBannerAction,
  updateCommunityDetailsAction,
  updateCommunityImageAction,
} from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import { useLocale } from "@/components/i18n/LocaleProvider";

type EditCommunityModalProps = {
  community: ForumCommunity;
  onClose: () => void;
};

const NAME_MAX = 21;
const DESC_MAX = 300;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{children}</p>
  );
}

export default function EditCommunityModal({ community, onClose }: EditCommunityModalProps) {
  const titleId = useId();
  const router = useRouter();
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const c = dictionary.common;
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const accentHex = communityAccentHex(community.accent_color);

  const [name, setName] = useState(community.title);
  const [description, setDescription] = useState(community.description);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(community.image_url);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(community.banner_url);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (iconFile && iconPreview && iconPreview !== community.image_url) {
        URL.revokeObjectURL(iconPreview);
      }
      if (bannerFile && bannerPreview && bannerPreview !== community.banner_url) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerFile, bannerPreview, community.banner_url, community.image_url, iconFile, iconPreview]);

  function onPickIcon(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(f.chooseImageError);
      return;
    }
    if (file.size > MAX_FORUM_IMAGE_BYTES) {
      setError(f.imageTooLarge);
      return;
    }
    if (iconPreview && iconPreview !== community.image_url) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    setIconRemoved(false);
  }

  function clearIcon() {
    if (iconPreview && iconPreview !== community.image_url) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(null);
    setIconPreview(null);
    setIconRemoved(Boolean(community.image_url));
    if (iconInputRef.current) iconInputRef.current.value = "";
  }

  function onPickBanner(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(f.chooseImageError);
      return;
    }
    if (file.size > MAX_FORUM_IMAGE_BYTES) {
      setError(f.imageTooLarge);
      return;
    }
    if (bannerPreview && bannerPreview !== community.banner_url) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setBannerRemoved(false);
  }

  function clearBanner() {
    if (bannerPreview && bannerPreview !== community.banner_url) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
    setBannerRemoved(Boolean(community.banner_url));
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function submit() {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    if (trimmedName.length < 3 || trimmedName.length > NAME_MAX || !trimmedDesc) {
      setError(f.nameDescError);
      return;
    }

    startTransition(async () => {
      setError("");

      let uploadedIconUrl: string | null | undefined;
      let uploadedBannerUrl: string | null | undefined;

      if (iconFile || bannerFile) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError(f.needSignIn);
          return;
        }
        if (iconFile) {
          const uploaded = await uploadForumImage({ userId: user.id, file: iconFile });
          if (!uploaded.ok) {
            setError(uploaded.error);
            return;
          }
          uploadedIconUrl = uploaded.url;
        }
        if (bannerFile) {
          const uploaded = await uploadForumImage({ userId: user.id, file: bannerFile });
          if (!uploaded.ok) {
            setError(uploaded.error);
            return;
          }
          uploadedBannerUrl = uploaded.url;
        }
      }

      const detailsRes = await updateCommunityDetailsAction(community.id, {
        title: trimmedName,
        description: trimmedDesc,
      });
      if (detailsRes?.error) {
        setError(detailsRes.error);
        return;
      }

      if (uploadedIconUrl !== undefined) {
        const iconRes = await updateCommunityImageAction(community.id, uploadedIconUrl);
        if (iconRes?.error) {
          setError(iconRes.error);
          return;
        }
      } else if (iconRemoved) {
        const iconRes = await updateCommunityImageAction(community.id, null);
        if (iconRes?.error) {
          setError(iconRes.error);
          return;
        }
      }

      if (uploadedBannerUrl !== undefined) {
        const bannerRes = await updateCommunityBannerAction(community.id, uploadedBannerUrl);
        if (bannerRes?.error) {
          setError(bannerRes.error);
          return;
        }
      } else if (bannerRemoved) {
        const bannerRes = await updateCommunityBannerAction(community.id, null);
        if (bannerRes?.error) {
          setError(bannerRes.error);
          return;
        }
      }

      invalidateSidebarCommunitiesCache();
      onClose();
      router.refresh();
    });
  }

  const showIconPreview = iconPreview && !iconRemoved;
  const showBannerPreview = bannerPreview && !bannerRemoved;
  const trimmedName = name.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label={c.close} className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white sm:rounded-2xl"
        style={{ boxShadow: "var(--sb-shadow-lg)" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              {f.editCommunityTitle}
            </h2>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{f.editCommunitySub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label={c.close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:gap-7">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`${titleId}-name`} className="text-xs font-semibold text-slate-500">
                      {f.communityNameLabel}
                    </label>
                    <span className="tabular-nums text-xs text-slate-400">
                      {trimmedName.length}/{NAME_MAX}
                    </span>
                  </div>
                  <input
                    id={`${titleId}-name`}
                    type="text"
                    value={name}
                    maxLength={NAME_MAX}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                  />
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`${titleId}-desc`} className="text-xs font-semibold text-slate-500">
                      {f.communityDescLabel}
                    </label>
                    <span className="tabular-nums text-xs text-slate-400">
                      {description.trim().length}/{DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    id={`${titleId}-desc`}
                    value={description}
                    maxLength={DESC_MAX}
                    rows={4}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <SectionLabel>{f.communityBanner}</SectionLabel>
                <p className="text-xs leading-relaxed text-slate-500">{f.communityBannerSub}</p>
                <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/80" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
                  <div className="relative aspect-[5/1] w-full overflow-hidden bg-slate-100">
                    {showBannerPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bannerPreview} alt="" className="h-full w-full object-cover object-center" />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${accentHex} 85%, white), color-mix(in srgb, ${accentHex} 40%, #14b8a6))`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-2.5">
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => onPickBanner(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      <ImagePlus size={14} />
                      {showBannerPreview ? f.changeBanner : f.uploadBanner}
                    </button>
                    {showBannerPreview ? (
                      <button
                        type="button"
                        onClick={clearBanner}
                        disabled={pending}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {f.removeBanner}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <SectionLabel>{f.changeCommunityIcon}</SectionLabel>
                <p className="text-xs leading-relaxed text-slate-500">{f.communityIconSub}</p>
                <div
                  className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                >
                  {showIconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconPreview}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-white"
                      style={{ boxShadow: "var(--sb-shadow-sm)" }}
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: accentHex, boxShadow: "var(--sb-shadow-sm)" }}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ring-4 ring-white"
                    >
                      {trimmedName ? trimmedName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => onPickIcon(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <ImagePlus size={14} />
                      {showIconPreview ? f.changeImage : f.uploadImage}
                    </button>
                    {showIconPreview ? (
                      <button
                        type="button"
                        onClick={clearIcon}
                        disabled={pending}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {f.removeCommunityIcon}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {error ? (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>
              ) : null}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-0">
                <div
                  className="rounded-2xl border border-slate-200 bg-white"
                  style={{ boxShadow: "var(--sb-shadow-sm)" }}
                >
                  <div className="relative aspect-[5/1] overflow-hidden rounded-t-2xl bg-slate-100">
                    {showBannerPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bannerPreview} alt="" className="h-full w-full object-cover object-center" />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${accentHex} 88%, white), color-mix(in srgb, ${accentHex} 45%, #14b8a6))`,
                        }}
                      />
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-0">
                    <div className="relative z-10 -mt-6 flex items-end">
                      {showIconPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={iconPreview}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover ring-[3px] ring-white"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: accentHex }}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-[3px] ring-white"
                        >
                          {trimmedName ? trimmedName.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                    </div>
                    <div className="relative z-0 mt-2 min-w-0 pl-0.5">
                      {trimmedName ? (
                        <p className="truncate text-sm font-extrabold text-slate-900">{trimmedName}</p>
                      ) : (
                        <p className="text-sm font-extrabold text-slate-300">—</p>
                      )}
                      {description.trim() ? (
                        <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-slate-500">
                          {description.trim()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
          >
            {c.cancel}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            aria-busy={pending}
            className="min-w-[5.5rem] rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: "var(--sb-gradient)" }}
          >
            {pending ? c.loading : c.save}
          </button>
        </div>
      </div>
    </div>
  );
}
