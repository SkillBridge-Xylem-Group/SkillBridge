"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeAvatarUrl } from "@/lib/avatar";
import { cn, getInitials } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

/** Shared user avatar: storage photo when valid, otherwise gradient initials. */
export default function UserAvatar({
  name,
  avatarUrl,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const src = normalizeAvatarUrl(avatarUrl);
  const initials = getInitials(name) || "?";

  return (
    <Avatar className={cn("shrink-0", className)}>
      {src ? <AvatarImage src={src} alt="" key={src} /> : null}
      <AvatarFallback
        className={cn("font-bold text-white", fallbackClassName)}
        style={{ background: "var(--sb-gradient)" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
