"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommunityAction } from "@/lib/actions/forum";
import { invalidateSidebarCommunitiesCache } from "@/components/dashboard/DashboardChrome";
import {
  COMMUNITY_ACCENT_COLORS,
  COMMUNITY_TOPICS,
  normalizeCommunitySlug,
  type CommunityAccentColor,
} from "@/lib/forumCommunities";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import {
  BookOpen,
  Briefcase,
  Car,
  Clapperboard,
  Cpu,
  Dumbbell,
  Flower2,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  ImagePlus,
  Landmark,
  Languages,
  Leaf,
  Megaphone,
  MessageCircleQuestion,
  Mountain,
  Music,
  Newspaper,
  Palette,
  Scale,
  Shirt,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { categoryLabel } from "@/lib/i18n/communityCategoryLabels";

type CreateCommunityModalProps = {
  onClose: () => void;
  /** Prefill topic chips (e.g. from discovery category filter). */
  initialTopics?: string[];
};

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Technology: Cpu,
  Design: Palette,
  Art: Palette,
  Business: Briefcase,
  Marketing: Megaphone,
  "Soft Skills": Users,
  Languages,
  Music,
  Fitness: Dumbbell,
  "Food & Lifestyle": UtensilsCrossed,
  Education: GraduationCap,
  "Games & Media": Clapperboard,
  Sciences: Leaf,
  "Reading & Writing": BookOpen,
  "Humanities & Law": Scale,
  "Education & Career": GraduationCap,
  "Business & Finance": Briefcase,
  Health: HeartPulse,
  Wellness: Flower2,
  Sports: Dumbbell,
  "Nature & Outdoors": Mountain,
  "Movies & TV": Clapperboard,
  "Internet Culture": Wifi,
  "Anime & Cosplay": BookOpen,
  "Pop Culture": Sparkles,
  "Fashion & Beauty": Shirt,
  "Home & Garden": Home,
  "Places & Travel": Globe2,
  "Collectibles & Hobbies": Trophy,
  "Q&As & Stories": MessageCircleQuestion,
  General: Landmark,
  // Legacy / misc (existing communities)
  "Food & Drinks": UtensilsCrossed,
  Games: Gamepad2,
  "Identity & Relationships": Heart,
  "News & Politics": Newspaper,
  Vehicles: Car,
};

const STEP_COUNT = 3;

const NAME_MAX = 21;
const DESC_MAX = 300;

export default function CreateCommunityModal({ onClose, initialTopics = [] }: CreateCommunityModalProps) {
  const titleId = useId();
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const f = dictionary.forum;
  const steps = [
    { key: "topics", title: f.createWizardAbout, subtitle: f.createWizardAboutSub },
    { key: "about", title: f.createWizardDetails, subtitle: f.createWizardDetailsSub },
    { key: "style", title: f.createWizardStyle, subtitle: f.createWizardStyleSub },
  ];
  const [step, setStep] = useState(0);
  const [topics, setTopics] = useState<string[]>(() =>
    initialTopics.filter((t) => (COMMUNITY_TOPICS as readonly string[]).includes(t)).slice(0, 3)
  );
  const [otherActive, setOtherActive] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const totalSelectedCount = topics.length + (otherActive ? 1 : 0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState<CommunityAccentColor>("brand");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const current = steps[step];
  const accentMeta = COMMUNITY_ACCENT_COLORS.find((c) => c.id === accent) ?? COMMUNITY_ACCENT_COLORS[0];
  const previewName = title.trim() || "communityname";
  const previewSlug = slug || normalizeCommunitySlug(previewName) || "communityname";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [iconPreview, bannerPreview]);

  function onTitleChange(value: string) {
    const next = value.slice(0, NAME_MAX);
    setTitle(next);
    if (!slugTouched) setSlug(normalizeCommunitySlug(next).slice(0, NAME_MAX));
  }

  function toggleTopic(topic: string) {
    setTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic);
      if (prev.length + (otherActive ? 1 : 0) >= 3) return prev;
      return [...prev, topic];
    });
  }

  function toggleOther() {
    setOtherActive((prev) => {
      if (prev) {
        setOtherValue("");
        return false;
      }
      if (topics.length >= 3) return prev;
      return true;
    });
  }

  function canContinue(): boolean {
    if (step === 0) return topics.length >= 1 || (otherActive && otherValue.trim().length >= 2);
    if (step === 1) {
      return title.trim().length >= 3 && description.trim().length >= 1 && previewSlug.length >= 3;
    }
    if (step === 2) return true;
    return false;
  }

  function goNext() {
    setError("");
    if (!canContinue()) {
      if (step === 0) setError(f.pickTopicError);
      if (step === 1) setError(f.nameDescError);
      return;
    }
    if (step < STEP_COUNT - 1) setStep((s) => s + 1);
    else submit();
  }

  function goBack() {
    setError("");
    if (step === 0) onClose();
    else setStep((s) => s - 1);
  }

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
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  }

  function clearIcon() {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconPreview(null);
    setIconFile(null);
    if (iconInputRef.current) iconInputRef.current.value = "";
  }

  function clearBanner() {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
    setBannerFile(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
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
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function submit() {
    startTransition(async () => {
      setError("");

      let imageUrl: string | null = null;
      let bannerUrl: string | null = null;
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
          imageUrl = uploaded.url;
        }
        if (bannerFile) {
          const uploaded = await uploadForumImage({ userId: user.id, file: bannerFile });
          if (!uploaded.ok) {
            setError(uploaded.error);
            return;
          }
          bannerUrl = uploaded.url;
        }
      }

      const finalTopics =
        otherActive && otherValue.trim() ? [...topics, otherValue.trim().slice(0, 40)].slice(0, 3) : topics;

      const res = await createCommunityAction({
        title: title.trim(),
        slug: previewSlug,
        description: description.trim(),
        category: finalTopics[0] ?? "General",
        visibility: "public",
        accentColor: accent,
        imageUrl,
        bannerUrl,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      onClose();
      invalidateSidebarCommunitiesCache();
      if (res?.slug) {
        router.push(`/dashboard/forum/c/${res.slug}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label={dictionary.common.close} className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92vh,40rem)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-extrabold text-slate-900">
              {current.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {step === 0 ? (
            <div>
              <div className="flex max-h-[min(22rem,50vh)] flex-wrap gap-2 overflow-y-auto pr-1">
                {COMMUNITY_TOPICS.map((topic) => {
                  const selected = topics.includes(topic);
                  const Icon = TOPIC_ICONS[topic] ?? Sparkles;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={16} className={selected ? "text-white" : "text-slate-500"} aria-hidden />
                      {categoryLabel(locale, topic)}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={toggleOther}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                    otherActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles size={16} className={otherActive ? "text-white" : "text-slate-500"} aria-hidden />
                  Other
                </button>
              </div>

              {otherActive ? (
                <div className="mt-3">
                  <input
                    type="text"
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value.slice(0, 40))}
                    placeholder="Type your own topic (e.g. Marketing)"
                    maxLength={40}
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Custom topics won't have their own Discover tab yet — your community will still show up under
                    "All".
                  </p>
                </div>
              ) : null}

              <p className="mt-3 text-xs text-slate-400">{totalSelectedCount}/3 topics selected</p>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="community-name" className="text-xs font-semibold text-slate-500">
                      Community name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {title.length}/{NAME_MAX}
                    </span>
                  </div>
                  <input
                    id="community-name"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    maxLength={NAME_MAX}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <label htmlFor="community-slug" className="text-xs font-semibold text-slate-500">
                    Link address
                  </label>
                  <input
                    id="community-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(normalizeCommunitySlug(e.target.value).slice(0, NAME_MAX));
                    }}
                    maxLength={NAME_MAX}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Used in the page link. Can’t be changed after creation.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="community-desc" className="text-xs font-semibold text-slate-500">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">{description.length}</span>
                  </div>
                  <textarea
                    id="community-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                    maxLength={DESC_MAX}
                    rows={5}
                    className="mt-1 w-full resize-none bg-transparent text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="h-16 rounded-xl bg-slate-100" />
                <div className="-mt-5 flex items-end gap-3 px-2">
                  {iconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconPreview}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover ring-4 ring-white"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: accentMeta.hex }}
                      className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white ring-4 ring-white"
                    >
                      {title.trim() ? title.trim().charAt(0).toUpperCase() : ""}
                    </div>
                  )}
                </div>
                <div className="mt-2 min-h-[5.5rem] min-w-0 px-2 pb-2">
                  {title.trim() ? (
                    <p className="break-words text-base font-extrabold text-slate-900">{title.trim()}</p>
                  ) : null}
                  {description.trim() ? (
                    <p className="mt-3 break-words text-sm leading-snug text-slate-600">{description.trim()}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-700">{f.communityBanner}</p>
                <p className="mt-0.5 text-xs text-slate-500">{f.communityBannerSub}</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-100">
                    {bannerPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${accentMeta.hex} 85%, white), color-mix(in srgb, ${accentMeta.hex} 40%, #14b8a6))`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
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
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ImagePlus size={16} />
                      {bannerPreview ? f.changeBanner : f.uploadBanner}
                    </button>
                    {bannerPreview ? (
                      <button
                        type="button"
                        onClick={clearBanner}
                        className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {f.removeBanner}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">Community icon</p>
                <p className="mt-0.5 text-xs text-slate-500">Upload a square image, or use a letter + color.</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {iconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconPreview}
                      alt="Community icon preview"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: accentMeta.hex }}
                      className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white"
                    >
                      {title.trim() ? title.trim().charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
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
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ImagePlus size={16} />
                      {iconPreview ? f.changeImage : f.uploadImage}
                    </button>
                    {iconPreview ? (
                      <button
                        type="button"
                        onClick={clearIcon}
                        className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">Icon color</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {f.communityIconSub}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {COMMUNITY_ACCENT_COLORS.map((color) => {
                    const selected = accent === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setAccent(color.id)}
                        aria-label={`Color ${color.id}`}
                        aria-pressed={selected}
                        style={{ backgroundColor: color.hex }}
                        className={`h-10 w-10 rounded-full transition ${
                          selected
                            ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                            : "hover:scale-105 ring-1 ring-black/10"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div
                className="max-w-sm rounded-3xl border border-slate-200 bg-white"
                style={{ boxShadow: "var(--sb-shadow-sm)" }}
              >
                <div className="relative aspect-[16/7] w-full overflow-hidden rounded-t-3xl">
                  {bannerPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${accentMeta.hex} 85%, white), color-mix(in srgb, ${accentMeta.hex} 40%, #14b8a6))`,
                      }}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent" />
                </div>
                <div className="px-4 pb-4">
                  <div className="relative z-10 -mt-7 mb-2 flex items-end gap-3">
                    {iconPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={iconPreview} alt="" className="h-12 w-12 rounded-full object-cover ring-4 ring-white" />
                    ) : (
                      <div
                        style={{ backgroundColor: accentMeta.hex }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ring-4 ring-white"
                      >
                        {title.trim() ? title.trim().charAt(0).toUpperCase() : ""}
                      </div>
                    )}
                    <div className="min-w-0 pb-1">
                      {title.trim() ? (
                        <p className="truncate font-extrabold text-slate-900">{title.trim()}</p>
                      ) : null}
                      {topics[0] ? (
                        <p className="text-xs text-slate-500">{categoryLabel(locale, topics[0])}</p>
                      ) : otherActive && otherValue.trim() ? (
                        <p className="text-xs text-slate-500">{otherValue.trim()}</p>
                      ) : null}
                    </div>
                  </div>
                  {description.trim() ? (
                    <p className="line-clamp-2 text-sm text-slate-600">{description.trim()}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-1.5" aria-label={`${step + 1} / ${STEP_COUNT}`}>
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 w-6 rounded-full transition ${i === step ? "bg-slate-800" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              {step === 0 ? dictionary.common.cancel : f.back}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={pending || !canContinue()}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {pending ? f.creating : step === STEP_COUNT - 1 ? f.createCommunityTitle : f.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}