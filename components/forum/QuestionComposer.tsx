"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Send, X } from "lucide-react";
import { createQuestionAction } from "@/lib/actions/forum";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import { FORUM_SUBFORUMS, getForumSubforum } from "@/lib/forumSubforums";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type CommunityOption = { slug: string; title: string };

type QuestionComposerProps = {
  userInitials: string;
  /** When set, posts are locked to this subforum (subforum page). */
  subforumSlug?: string;
  /** When true (hub page), user must pick a community before posting. */
  requireSubforumSelect?: boolean;
  /** Dynamic community list for the picker (falls back to static catalog). */
  communityOptions?: CommunityOption[];
  /** Open the create dialog on mount (e.g. ?compose=1). */
  defaultOpen?: boolean;
};

export default function QuestionComposer({
  userInitials,
  subforumSlug: lockedSlug,
  requireSubforumSelect = false,
  communityOptions,
  defaultOpen = false,
}: QuestionComposerProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const options =
    communityOptions && communityOptions.length > 0
      ? communityOptions
      : FORUM_SUBFORUMS.map((s) => ({ slug: s.slug, title: s.title }));

  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(lockedSlug ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const router = useRouter();

  const effectiveSlug = lockedSlug ?? selectedSlug;
  const lockedTitle =
    lockedSlug
      ? options.find((o) => o.slug === lockedSlug)?.title ?? getForumSubforum(lockedSlug).title
      : null;
  const lockedSubforum = lockedSlug ? { slug: lockedSlug, title: lockedTitle ?? lockedSlug } : null;

  // Soft-nav to ?compose=1 does not remount this client tree — sync open state.
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  useEffect(() => {
    function onComposeOpen() {
      setOpen(true);
    }
    window.addEventListener("sb-forum-compose-open", onComposeOpen);
    return () => window.removeEventListener("sb-forum-compose-open", onComposeOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function resetForm() {
    setTitle("");
    setContent("");
    setError("");
    if (!lockedSlug) setSelectedSlug("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function close() {
    if (isPending) return;
    setOpen(false);
    resetForm();
    if (lockedSlug) {
      router.replace(`/dashboard/forum/c/${lockedSlug}`, { scroll: false });
    }
  }

  function onPickImage(file: File | undefined) {
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
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function submit() {
    startTransition(async () => {
      setError("");
      if (!effectiveSlug) {
        setError("Choose a community to post in.");
        return;
      }

      let imageUrl: string | null = null;

      if (imageFile) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("You need to be signed in to post.");
          return;
        }
        const uploaded = await uploadForumImage({ userId: user.id, file: imageFile });
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        imageUrl = uploaded.url;
      }

      const result = await createQuestionAction(title, content, imageUrl, effectiveSlug);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      resetForm();
      if (result?.questionId) {
        router.push(`/dashboard/forum/${result.questionId}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  const canSubmit =
    title.trim().length > 0 &&
    (content.trim().length > 0 || !!imageFile) &&
    (!!lockedSlug || !!selectedSlug);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={dictionary.common.close}
        className="absolute inset-0 bg-slate-900/55"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-[24px]"
        style={{ boxShadow: "var(--sb-shadow-lg)" }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #eef7f0" }}>
          <h2 id={titleId} className="text-xl font-extrabold nb-heading">
            {f.createPost}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3.5 overflow-y-auto px-6 py-5">
          <div className="mb-1 flex items-center gap-3.5">
            <div className="nb-avatar h-11 w-11 text-sm" style={{ background: "var(--sb-gradient)" }}>
              {userInitials}
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--sb-ink)" }}>
              {lockedSubforum
                ? interpolate(f.postingIn, { title: lockedSubforum.title })
                : f.shareWithCommunity}
            </p>
          </div>

          {requireSubforumSelect && !lockedSlug ? (
            <div>
              <label htmlFor="composer-subforum" className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--sb-muted)" }}>
                {f.community}
              </label>
              <select
                id="composer-subforum"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="nb-input mt-1.5 px-3 py-2.5 text-sm font-semibold"
              >
                <option value="">{f.chooseCommunity}</option>
                {options.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={f.titlePlaceholder}
            maxLength={150}
            className="nb-input px-4 py-3.5 text-[14.5px]"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={f.detailsPlaceholder}
            rows={5}
            className="nb-input resize-none px-4 py-3.5 text-[14.5px]"
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Upload preview" className="max-h-72 w-full object-contain" />
              <button
                type="button"
                onClick={clearImage}
                disabled={isPending}
                className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900 disabled:opacity-50"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: "1px solid #eef7f0" }}>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="nb-btn bg-white px-4 py-2.5 text-sm disabled:opacity-50"
              style={{ color: "var(--sb-muted)" }}
            >
              <ImagePlus size={16} />
              {f.uploadImage}
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={isPending || !canSubmit}
            className="nb-btn px-6 py-2.5 text-[14.5px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--sb-gradient)" }}
          >
            {isPending ? f.posting : f.postAction}
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
