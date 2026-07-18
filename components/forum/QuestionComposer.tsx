"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Send, X } from "lucide-react";
import { createQuestionAction } from "@/lib/actions/forum";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import { FORUM_SUBFORUMS, getForumSubforum } from "@/lib/forumSubforums";

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
    if (defaultOpen && lockedSlug) {
      router.replace(`/dashboard/forum/c/${lockedSlug}`);
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

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-pill inline-flex items-center gap-2 bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
            {userInitials}
          </span>
          <span className="truncate">
            {lockedSubforum ? `Post in ${lockedSubforum.title}...` : "Create a post..."}
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close create post"
            className="absolute inset-0 bg-slate-900/40"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-2xl border border-slate-100 bg-white shadow-xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 id={titleId} className="text-base font-extrabold text-slate-900">
                Create a post
              </h2>
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                aria-label="Close"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                  {userInitials}
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {lockedSubforum ? `Posting in ${lockedSubforum.title}` : "Share with the community"}
                </p>
              </div>

              {requireSubforumSelect && !lockedSlug ? (
                <div>
                  <label htmlFor="composer-subforum" className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Community
                  </label>
                  <select
                    id="composer-subforum"
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand focus:outline-none"
                  >
                    <option value="">Choose a community</option>
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
                placeholder="Title"
                maxLength={150}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add details (optional if you attach an image)..."
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand focus:outline-none"
              />

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <ImagePlus size={16} />
                  Images
                </button>
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={isPending || !canSubmit}
                className="btn-pill flex items-center gap-2 bg-brand px-5 py-2 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Posting..." : "Post"}
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
