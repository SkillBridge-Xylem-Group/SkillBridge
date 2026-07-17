"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type GifItem = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
};

type GifPickerProps = {
  onSelect: (url: string) => void;
  onClose: () => void;
};

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadGifs = useCallback(async (search: string) => {
    setLoading(true);
    setError("");
    try {
      const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
      const res = await fetch(`/api/giphy${params}`);
      const data = (await res.json()) as { gifs?: GifItem[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load GIFs.");
        setGifs([]);
        return;
      }
      setGifs(data.gifs ?? []);
    } catch {
      setError("Could not load GIFs.");
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGifs("");
  }, [loadGifs]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void loadGifs(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, loadGifs]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIPHY"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand/40 focus:bg-white focus:outline-none"
            autoFocus
          />
        </div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Powered by GIPHY</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close GIF picker"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-80 overflow-y-auto p-2">
        {loading ? (
          <p className="px-2 py-12 text-center text-sm text-slate-500">Loading GIFs…</p>
        ) : error ? (
          <p className="px-2 py-12 text-center text-sm text-red-600">{error}</p>
        ) : gifs.length === 0 ? (
          <p className="px-2 py-12 text-center text-sm text-slate-500">No GIFs found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect(gif.url)}
                className="overflow-hidden rounded-lg bg-slate-100 transition hover:ring-2 hover:ring-brand/40"
                title={gif.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gif.url} alt={gif.title} className="aspect-square w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
