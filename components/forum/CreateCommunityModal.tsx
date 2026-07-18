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
  Eye,
  EyeOff,
  Flower2,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  ImagePlus,
  Landmark,
  Leaf,
  Lock,
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

type CreateCommunityModalProps = {
  onClose: () => void;
  /** Prefill topic chips (e.g. from discovery category filter). */
  initialTopics?: string[];
};

type Visibility = "public" | "restricted" | "private";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "Anime & Cosplay": BookOpen,
  Art: Palette,
  "Business & Finance": Briefcase,
  "Collectibles & Hobbies": Trophy,
  "Education & Career": GraduationCap,
  "Fashion & Beauty": Shirt,
  "Food & Drinks": UtensilsCrossed,
  Games: Gamepad2,
  Health: HeartPulse,
  "Home & Garden": Home,
  "Humanities & Law": Scale,
  "Identity & Relationships": Heart,
  "Internet Culture": Wifi,
  "Movies & TV": Clapperboard,
  Music: Music,
  "Nature & Outdoors": Mountain,
  "News & Politics": Newspaper,
  "Places & Travel": Globe2,
  "Pop Culture": Sparkles,
  "Q&As & Stories": MessageCircleQuestion,
  "Reading & Writing": BookOpen,
  Sciences: Leaf,
  Sports: Dumbbell,
  Technology: Cpu,
  Vehicles: Car,
  Wellness: Flower2,
  Design: Palette,
  Marketing: Megaphone,
  "Soft Skills": Users,
  General: Landmark,
};

const STEPS = [
  {
    key: "topics",
    title: "What will your community be about?",
    subtitle: "Choose up to 3 topics to help people discover your community.",
  },
  {
    key: "about",
    title: "Tell us about your community",
    subtitle: "A name and description help people understand what your community is all about.",
  },
  {
    key: "style",
    title: "Style your community",
    subtitle: "Add an icon image or color so your community stands out. You can change this later.",
  },
  {
    key: "type",
    title: "What kind of community is this?",
    subtitle: "Decide who can view and contribute. You can change this later.",
  },
] as const;

const NAME_MAX = 21;
const DESC_MAX = 300;

export default function CreateCommunityModal({ onClose, initialTopics = [] }: CreateCommunityModalProps) {
  const titleId = useId();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [topics, setTopics] = useState<string[]>(() =>
    initialTopics.filter((t) => (COMMUNITY_TOPICS as readonly string[]).includes(t)).slice(0, 3)
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState<CommunityAccentColor>("brand");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const iconInputRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
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
    };
  }, [iconPreview]);

  function onTitleChange(value: string) {
    const next = value.slice(0, NAME_MAX);
    setTitle(next);
    if (!slugTouched) setSlug(normalizeCommunitySlug(next).slice(0, NAME_MAX));
  }

  function toggleTopic(topic: string) {
    setTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic);
      if (prev.length >= 3) return prev;
      return [...prev, topic];
    });
  }

  function canContinue(): boolean {
    if (step === 0) return topics.length >= 1;
    if (step === 1) {
      return title.trim().length >= 3 && description.trim().length >= 1 && previewSlug.length >= 3;
    }
    if (step === 2) return true;
    if (step === 3) return Boolean(visibility);
    return false;
  }

  function goNext() {
    setError("");
    if (!canContinue()) {
      if (step === 0) setError("Pick at least one topic.");
      if (step === 1) setError("Add a name (3–21 chars) and a description.");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
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
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FORUM_IMAGE_BYTES) {
      setError("Image is too large (max 10MB).");
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

  function submit() {
    startTransition(async () => {
      setError("");

      let imageUrl: string | null = null;
      if (iconFile) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("You need to be signed in.");
          return;
        }
        const uploaded = await uploadForumImage({ userId: user.id, file: iconFile });
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        imageUrl = uploaded.url;
      }

      const res = await createCommunityAction({
        title: title.trim(),
        slug: previewSlug,
        description: description.trim(),
        category: topics[0] ?? "General",
        visibility,
        accentColor: accent,
        imageUrl,
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
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
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
                      {topic}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-400">{topics.length}/3 topics selected</p>
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

              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
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
                <div className="mt-2 min-h-[5.5rem] px-2 pb-2">
                  {title.trim() ? (
                    <p className="text-base font-extrabold text-slate-900">{title.trim()}</p>
                  ) : null}
                  {description.trim() ? (
                    <p className="mt-3 text-sm leading-snug text-slate-600">{description.trim()}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
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
                      {iconPreview ? "Change image" : "Upload image"}
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
                  Used when no custom image is set (and for the banner).
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

              <div className="max-w-sm rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  {iconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconPreview} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div
                      style={{ backgroundColor: accentMeta.hex }}
                      className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
                    >
                      {title.trim() ? title.trim().charAt(0).toUpperCase() : ""}
                    </div>
                  )}
                  <div>
                    {title.trim() ? (
                      <p className="font-extrabold text-slate-900">{title.trim()}</p>
                    ) : null}
                    {topics[0] ? <p className="text-xs text-slate-500">{topics[0]}</p> : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-2">
              {(
                [
                  {
                    id: "public" as const,
                    icon: Globe2,
                    label: "Public",
                    desc: "Anyone can view, post, and comment in this community.",
                  },
                  {
                    id: "restricted" as const,
                    icon: Users,
                    label: "Restricted",
                    desc: "Anyone can view, but only approved members can post.",
                  },
                  {
                    id: "private" as const,
                    icon: Lock,
                    label: "Private",
                    desc: "Only approved members can view and contribute.",
                  },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const selected = visibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVisibility(opt.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      selected
                        ? "border-brand bg-brand-light/50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={20} className={selected ? "text-brand" : "text-slate-500"} />
                    <span>
                      <span className="block text-sm font-extrabold text-slate-900">{opt.label}</span>
                      <span className="mt-0.5 block text-sm text-slate-500">{opt.desc}</span>
                    </span>
                    {selected ? (
                      <Eye size={16} className="ml-auto shrink-0 text-brand" />
                    ) : (
                      <EyeOff size={16} className="ml-auto shrink-0 text-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((_, i) => (
              <span
                key={STEPS[i].key}
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
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={pending || !canContinue()}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {pending ? "Creating…" : step === STEPS.length - 1 ? "Create Community" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
