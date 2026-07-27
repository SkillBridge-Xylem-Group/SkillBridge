"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileText, Paperclip, Send } from "lucide-react";
import EmojiPicker from "@/components/messages/EmojiPicker";
import UserAvatar from "@/components/ui/UserAvatar";
import type { ChatMessage } from "@/hooks/useSwapWebRtc";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type Props = {
  messages: ChatMessage[];
  userId: string;
  partnerName: string;
  partnerAvatarUrl: string | null;
  viewerName: string;
  viewerAvatarUrl: string | null;
  onSend: (text: string) => Promise<boolean>;
  onSendFile: (file: File, caption?: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  disabled?: boolean;
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SessionChat({
  messages,
  userId,
  partnerName,
  partnerAvatarUrl,
  viewerName,
  viewerAvatarUrl,
  onSend,
  onSendFile,
  disabled,
}: Props) {
  const { dictionary } = useLocale();
  const s = dictionary.swapSession;
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending || disabled) return;
    setSending(true);
    setFileError(null);
    const text = draft;
    setDraft("");
    try {
      const ok = await onSend(text);
      if (!ok) setDraft(text);
    } finally {
      setSending(false);
    }
  }

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || sending || disabled) return;
    setSending(true);
    setFileError(null);
    try {
      const result = await onSendFile(file, draft.trim());
      if (result.ok) {
        setDraft("");
      } else {
        setFileError(result.error);
      }
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:min-h-0">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={partnerName} avatarUrl={partnerAvatarUrl} className="h-9 w-9 text-xs" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{s.sessionChatTitle}</h2>
            <p className="text-xs text-slate-500">{interpolate(s.messageWhileSwap, { name: partnerName })}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-slate-400">{s.noMessagesYet}</p>
        ) : (
          messages.map((m) => {
            const mine = m.from === userId;
            const attachment = m.attachment;
            const isImage = Boolean(attachment?.mime.startsWith("image/"));

            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && (
                  <UserAvatar
                    name={partnerName}
                    avatarUrl={partnerAvatarUrl}
                    className="mb-5 h-8 w-8 shrink-0 text-[10px]"
                  />
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-brand text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {m.fromName}
                    </p>
                  )}

                  {attachment && isImage && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      download={attachment.name}
                      className="mb-2 block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-h-56 max-w-full rounded-xl object-contain"
                      />
                    </a>
                  )}

                  {attachment && !isImage && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      download={attachment.name}
                      className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                        mine ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <FileText size={16} className="shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate">{attachment.name}</span>
                        <span className={mine ? "text-white/70" : "text-slate-400"}>
                          {formatBytes(attachment.size)} · {s.download}
                        </span>
                      </span>
                    </a>
                  )}

                  {m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null}

                  <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                    {new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                {mine && (
                  <UserAvatar
                    name={viewerName}
                    avatarUrl={viewerAvatarUrl}
                    className="mb-5 h-8 w-8 shrink-0 text-[10px]"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {fileError && (
        <p className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">{fileError}</p>
      )}

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx,.zip"
            onChange={(e) => void handleFileChange(e.target.files)}
          />
          <button
            type="button"
            disabled={disabled || sending}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label={s.attachFile}
            title={s.attachFile}
          >
            <Paperclip size={18} />
          </button>
          <EmojiPicker onSelect={(emoji) => setDraft((prev) => `${prev}${emoji}`)} />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={s.typeMessage}
            disabled={disabled || sending}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none disabled:opacity-50"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={disabled || sending || !draft.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
            aria-label={dictionary.messages.send}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
