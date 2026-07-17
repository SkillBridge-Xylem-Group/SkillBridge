"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bold, Code, Image as ImageIcon, Italic, Link2, Strikethrough, Video, X } from "lucide-react";
import { createAnswerAction } from "@/lib/actions/forum";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";

type AnswerComposerProps = {
  questionId: string;
  userInitials: string;
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = "text"
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const next = `${textarea.value.slice(0, start)}${before}${selected}${after}${textarea.value.slice(end)}`;
  return { next, cursor: start + before.length + selected.length + after.length };
}

export default function AnswerComposer({ questionId, userInitials }: AnswerComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (expanded) textareaRef.current?.focus();
  }, [expanded]);

  function resetForm() {
    setContent("");
    setError("");
    setShowFormat(false);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (gifInputRef.current) gifInputRef.current.value = "";
  }

  function cancel() {
    if (isPending) return;
    resetForm();
    setExpanded(false);
  }

  function onPickImage(file: File | undefined, isGif = false) {
    setError("");
    if (!file) return;
    const okType = isGif ? file.type === "image/gif" : file.type.startsWith("image/");
    if (!okType) {
      setError(isGif ? "Please choose a GIF file." : "Please choose an image file.");
      return;
    }
    if (file.size > MAX_FORUM_IMAGE_BYTES) {
      setError("File is too large (max 10MB).");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExpanded(true);
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (gifInputRef.current) gifInputRef.current.value = "";
  }

  function applyFormat(kind: "bold" | "italic" | "strike" | "code" | "link") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const wraps = {
      bold: ["**", "**"],
      italic: ["*", "*"],
      strike: ["~~", "~~"],
      code: ["`", "`"],
      link: ["[", "](url)"],
    } as const;
    const [before, after] = wraps[kind];
    const { next, cursor } = wrapSelection(textarea, before, after, kind === "link" ? "label" : "text");
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function addVideoLink() {
    const url = window.prompt("Paste a video link (YouTube, Vimeo, etc.)");
    if (!url?.trim()) return;
    setExpanded(true);
    setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${url.trim()}` : url.trim()));
    textareaRef.current?.focus();
  }

  function submit() {
    startTransition(async () => {
      setError("");
      let imageUrl: string | null = null;

      if (imageFile) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("You need to be signed in to reply.");
          return;
        }
        const uploaded = await uploadForumImage({ userId: user.id, file: imageFile });
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        imageUrl = uploaded.url;
      }

      const result = await createAnswerAction(questionId, content, imageUrl);
      if (result?.error) {
        setError(result.error);
        return;
      }
      resetForm();
      setExpanded(false);
      router.refresh();
    });
  }

  const canSubmit = content.trim().length > 0 || !!imageFile;

  if (!expanded) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
          {userInitials}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-400 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Join the conversation
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
        {userInitials}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Join the conversation"
          rows={4}
          className="w-full resize-y border-0 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />

        {imagePreview ? (
          <div className="relative mx-4 mb-3 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Upload preview" className="max-h-56 w-full object-contain" />
            <button
              type="button"
              onClick={clearImage}
              disabled={isPending}
              className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900 disabled:opacity-50"
              aria-label="Remove attachment"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        {showFormat ? (
          <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 px-3 py-2">
            {(
              [
                ["bold", Bold, "Bold"],
                ["italic", Italic, "Italic"],
                ["strike", Strikethrough, "Strikethrough"],
                ["code", Code, "Code"],
                ["link", Link2, "Link"],
              ] as const
            ).map(([kind, Icon, label]) => (
              <button
                key={kind}
                type="button"
                onClick={() => applyFormat(kind)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="px-4 pb-2 text-xs font-medium text-red-600">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-0.5">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0], false)}
            />
            <input
              ref={gifInputRef}
              type="file"
              accept="image/gif"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0], true)}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              aria-label="Add image"
            >
              <ImageIcon size={18} />
            </button>
            <button
              type="button"
              onClick={addVideoLink}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              aria-label="Add video link"
            >
              <Video size={18} />
            </button>
            <button
              type="button"
              onClick={() => gifInputRef.current?.click()}
              disabled={isPending}
              className="flex h-9 items-center justify-center rounded-lg px-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              aria-label="Add GIF"
            >
              GIF
            </button>
            <button
              type="button"
              onClick={() => setShowFormat((v) => !v)}
              disabled={isPending}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition disabled:opacity-50 ${
                showFormat ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              aria-label="Formatting"
            >
              Aa
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={isPending}
              className="btn-pill border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !canSubmit}
              className="btn-pill bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
