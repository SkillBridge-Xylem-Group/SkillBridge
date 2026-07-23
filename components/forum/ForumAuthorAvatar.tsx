"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

type ForumAuthorAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  textClassName?: string;
};

export default function ForumAuthorAvatar({
  name,
  avatarUrl,
  className,
  textClassName,
}: ForumAuthorAvatarProps) {
  return (
    <UserAvatar
      name={name}
      avatarUrl={avatarUrl}
      className={cn("h-10 w-10 text-xs", className)}
      fallbackClassName={textClassName}
    />
  );
}
