"use client";

type ProfileUsernameMetaProps = {
  username: string;
  className?: string;
};

export default function ProfileUsernameMeta({ username, className = "" }: ProfileUsernameMetaProps) {
  if (!username) return null;

  return (
    <p className={`text-sm font-semibold ${className}`} style={{ color: "var(--sb-muted)" }}>
      @{username}
    </p>
  );
}
