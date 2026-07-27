"use client";

import type { ReactNode } from "react";
import UserAvatar from "@/components/ui/UserAvatar";

type Props = {
  name: string;
  avatarUrl: string | null;
  label: string;
  bindVideo: (el: HTMLVideoElement | null) => void;
  showVideo: boolean;
  muted?: boolean;
  overlay?: ReactNode;
  tileClassName?: string;
  avatarClassName?: string;
  compact?: boolean;
};

/** Video tile with profile-photo fallback when camera is off or not connected. */
export default function ParticipantVideoTile({
  name,
  avatarUrl,
  label,
  bindVideo,
  showVideo,
  muted,
  overlay,
  tileClassName = "bg-slate-900",
  avatarClassName = "h-12 w-12 text-sm",
  compact = false,
}: Props) {
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl shadow-sm ${
        compact ? "xl:aspect-auto xl:min-h-[120px] xl:max-h-[160px]" : "xl:aspect-auto xl:min-h-[150px] xl:max-h-[200px]"
      } ${tileClassName}`}
    >
      <video
        ref={bindVideo}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${showVideo ? "" : "opacity-0"}`}
      />
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/90 px-4 text-center">
          <UserAvatar name={name} avatarUrl={avatarUrl} className={avatarClassName} />
          <p className="text-xs font-semibold text-white">{name}</p>
          {overlay}
        </div>
      )}
      <span className="absolute bottom-2 left-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
        <UserAvatar name={name} avatarUrl={avatarUrl} className="h-5 w-5 text-[9px]" />
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}
