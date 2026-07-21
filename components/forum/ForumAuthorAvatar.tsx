"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export default function ForumAuthorAvatar({
  name,
  avatarUrl,
  className,
  textClassName,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Avatar className={cn("h-10 w-10 text-xs", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback
        className={cn("font-bold text-white", textClassName)}
        style={{ background: "var(--sb-gradient)" }}
      >
        {initialsFromName(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
