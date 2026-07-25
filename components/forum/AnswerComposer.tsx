"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bold, Code, Image as ImageIcon, Italic, Link2, Strikethrough, Video, X } from "lucide-react";
import { createAnswerAction } from "@/lib/actions/forum";
import { FORUM_JOIN_REQUIRED } from "@/lib/forumCommunities";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAX_FORUM_IMAGE_BYTES, uploadForumImage } from "@/lib/forumImageUpload";
import GifPicker from "./GifPicker";
import { useLocale } from "@/components/i18n/LocaleProvider";
import UserAvatar from "@/components/ui/UserAvatar";

type AnswerComposerProps = {
  questionId: string;
  userName: string;
  userAvatarUrl?: string | null;
  parentAnswerId?: string | null;
  compact?: boolean;
  defaultExpanded?: boolean;
  onCancel?: () => void;
  onPosted?: () => void;
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

function revokeBlobPreview(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function AnswerComposer({
  questionId,
  userName,
  userAvatarUrl = null,
  parentAnswerId = null,
  compact = false,
  defaultExpanded = false,
  onCancel,
  onPosted,
}: AnswerComposerProps) {
  const { dictionary } = useLocale();
  const f = dictionary.forum;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      revokeBlobPreview(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (expanded) textareaRef.current?.focus();
  }, [expanded]);

  function resetForm() {
    setContent("");
    setError("");
    setShowFormat(false);
    setShowGifPicker(false);
    revokeBlobPreview(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setRemoteImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function cancel() {
    if (isPending) return;
    resetForm();
    setExpanded(false);
    onCancel?.();
  }

  function onPickImage(file: File | undefined) {
    setError("");
    setShowGifPicker(false);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FORUM_IMAGE_BYTES) {
      setError("File is too large (max 10MB).");
      return;
    }
    revokeBlobPreview(imagePreview);
    setRemoteImageUrl(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExpanded(true);
  }

  function onSelectGif(url: string) {
    setError("");
    revokeBlobPreview(imagePreview);
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setRemoteImageUrl(url);
    setImagePreview(url);
    setShowGifPicker(false);
    setExpanded(true);
  }

  function clearImage() {
    revokeBlobPreview(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setRemoteImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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
    setShowGifPicker(false);
    setExpanded(true);
    setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${url.trim()}` : url.trim()));
    textareaRef.current?.focus();
  }

  function submit() {
    startTransition(async () => {
      setError("");
      let imageUrl: string | null = remoteImageUrl;

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

      const result = await createAnswerAction(questionId, content, imageUrl, parentAnswerId);
      if (result?.error) {
        setError(result.error === FORUM_JOIN_REQUIRED ? f.joinToCommentHint : result.error);
        return;
      }
      resetForm();
      setExpanded(false);
      onPosted?.();
      router.refresh();
    });
  }

  const canSubmit = content.trim().length > 0 || !!imageFile || !!remoteImageUrl;
  const placeholder = f.joinConversation;

  if (!expanded) {
    return (
      <div className={`flex items-start gap-3 ${compact ? "pl-0" : ""}`}>
        {!compact ? (
          <UserAvatar name={userName} avatarUrl={userAvatarUrl} className="h-9 w-9 text-xs" />
        ) : null}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="nb-input min-w-0 flex-1 px-4 py-3 text-left text-sm"
          style={{ color: "var(--sb-muted)" }}
        >
          {placeholder}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {!compact ? (
        <UserAvatar name={userName} avatarUrl={userAvatarUrl} className="h-9 w-9 text-xs" />
      ) : null}

      <div
        className="relative min-w-0 flex-1 overflow-visible rounded-2xl bg-white"
        style={{ boxShadow: "var(--sb-shadow-sm)" }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 3 : 4}
          className="w-full resize-y border-0 bg-transparent px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0"
          style={{ color: "var(--sb-ink)" }}
        />

        {imagePreview ? (
          <div className="relative mx-4 mb-3 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Attachment preview" className="max-h-56 w-full object-contain" />
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
          <div className="flex flex-wrap items-center gap-1 px-3 py-2" style={{ borderTop: "1px solid #eef7f0" }}>
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
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100"
                style={{ color: "var(--sb-muted)" }}
                aria-label={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="px-4 pb-2 text-xs font-medium text-red-600">{error}</p> : null}

        <div
          className="relative flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
          style={{ borderTop: "1px solid #eef7f0" }}
        >
          {showGifPicker ? (
            <div className="absolute left-3 top-full z-30 mt-1 w-[65%] min-w-[280px] max-w-[420px]">
              <GifPicker onSelect={onSelectGif} onClose={() => setShowGifPicker(false)} />
            </div>
          ) : null}
          <div className="flex items-center gap-0.5">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(false);
                imageInputRef.current?.click();
              }}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-50"
              style={{ color: "var(--sb-muted)" }}
              aria-label="Add image"
            >
              <ImageIcon size={18} />
            </button>
            <button
              type="button"
              onClick={addVideoLink}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-50"
              style={{ color: "var(--sb-muted)" }}
              aria-label="Add video link"
            >
              <Video size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowGifPicker((open) => !open)}
              disabled={isPending}
              className="flex h-9 items-center justify-center rounded-lg px-2 text-xs font-extrabold transition hover:bg-slate-100 disabled:opacity-50"
              style={{
                color: showGifPicker ? "var(--sb-teal-dark)" : "var(--sb-muted)",
                background: showGifPicker ? "var(--sb-emerald-light)" : "transparent",
              }}
              aria-label="Add GIF"
              aria-expanded={showGifPicker}
            >
              GIF
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(false);
                setShowFormat((v) => !v);
              }}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition hover:bg-slate-100 disabled:opacity-50"
              style={{
                color: showFormat ? "var(--sb-teal-dark)" : "var(--sb-muted)",
                background: showFormat ? "var(--sb-emerald-light)" : "transparent",
              }}
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
              className="nb-btn bg-white px-4 py-1.5 text-xs disabled:opacity-50"
              style={{ color: "var(--sb-ink)" }}
            >
              {f.commentCancel}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || !canSubmit}
              className="nb-btn px-4 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--sb-gradient)" }}
            >
              {isPending ? f.posting : parentAnswerId ? f.replyAction : f.commentAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
