"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Single source of truth for banner shape — used by the cropper AND every display spot. */
export const BANNER_ASPECT_RATIO = 3; // width / height (3:1)

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / BANNER_ASPECT_RATIO);

type BannerCropperProps = {
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
};

export default function BannerCropper({
  file,
  onCancel,
  onCropped,
  title,
  confirmLabel,
  cancelLabel,
}: BannerCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onImageLoad() {
    if (!imgRef.current) return;
    setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function coverScale(): number {
    if (!naturalSize || !containerRef.current) return 1;
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    return Math.max(cw / naturalSize.w, ch / naturalSize.h);
  }

  function clampPan(next: { x: number; y: number }, currentZoom: number) {
    if (!naturalSize || !containerRef.current) return next;
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const scale = coverScale() * currentZoom;
    const maxX = Math.max(0, (naturalSize.w * scale - cw) / 2);
    const maxY = Math.max(0, (naturalSize.h * scale - ch) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clampPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }, zoom));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function onZoomChange(next: number) {
    setZoom(next);
    setPan((p) => clampPan(p, next));
  }

  const confirm = useCallback(() => {
    if (!naturalSize || !containerRef.current || !imgRef.current) return;
    setBusy(true);
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const r = OUTPUT_WIDTH / cw;
    const scale = coverScale() * zoom;
    const drawW = naturalSize.w * scale * r;
    const drawH = naturalSize.h * scale * r;
    const centerX = (cw / 2 + pan.x) * r;
    const centerY = (ch / 2 + pan.y) * r;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }
    ctx.drawImage(imgRef.current, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (!blob) return;
        const cropped = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, "") + "-banner.jpg",
          { type: "image/jpeg" }
        );
        onCropped(cropped);
      },
      "image/jpeg",
      0.9
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize, zoom, pan, file.name, onCropped]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            aria-label={cancelLabel}
          >
            <X size={16} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full touch-none overflow-hidden rounded-xl bg-slate-100"
          style={{ aspectRatio: `${BANNER_ASPECT_RATIO} / 1` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              draggable={false}
              onLoad={onImageLoad}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={
                naturalSize
                  ? {
                      width: naturalSize.w * coverScale() * zoom,
                      height: naturalSize.h * coverScale() * zoom,
                      transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
                    }
                  : undefined
              }
            />
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy || !naturalSize}
            className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: "var(--sb-gradient)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}