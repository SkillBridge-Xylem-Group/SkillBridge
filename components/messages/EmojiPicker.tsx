"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const EMOJIS = [
  "😀", "😂", "😍", "😊", "😉", "😎", "🤔", "😅", "😢", "😭",
  "😡", "😴", "🥳", "😱", "🙌", "👍", "👎", "👏", "🙏", "💪",
  "❤️", "🔥", "🎉", "✨", "👋", "😇", "🤗", "😆", "🙄", "😬",
];

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const { dictionary } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={dictionary.messages.addEmoji}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
        style={{ color: "var(--sb-muted)" }}
      >
        <Smile size={18} />
      </button>

      {open && (
        <div
          className="absolute bottom-12 left-0 z-20 grid w-64 grid-cols-6 gap-1 rounded-2xl bg-white p-3"
          style={{ boxShadow: "var(--sb-shadow-lg)" }}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-slate-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
