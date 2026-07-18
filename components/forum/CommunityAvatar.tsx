import {
  communityAccentHex,
  type CommunityAccentColor,
} from "@/lib/forumCommunities";

type CommunityAvatarProps = {
  title: string;
  imageUrl?: string | null;
  accentColor?: CommunityAccentColor | string | null;
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra outline for banner headers (readable on any background). */
  contrast?: boolean;
  className?: string;
};

const SIZE = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-2xl",
  xl: "h-[4.5rem] w-[4.5rem] text-[1.75rem] leading-none",
} as const;

/** Shared community icon: custom image, else colored letter avatar. */
export default function CommunityAvatar({
  title,
  imageUrl,
  accentColor,
  size = "md",
  contrast = false,
  className = "",
}: CommunityAvatarProps) {
  const letter = (title.trim().charAt(0) || "?").toUpperCase();
  const sizeClass = SIZE[size];
  const isDigit = /^\d$/.test(letter);
  const hex = communityAccentHex(accentColor);

  const outline = contrast
    ? "ring-[3px] ring-white shadow-[0_0_0_1px_rgba(15,23,42,0.18),0_6px_18px_rgba(15,23,42,0.2)]"
    : "ring-1 ring-black/10";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover ${outline} ${className}`.trim()}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ backgroundColor: hex }}
      className={`flex shrink-0 items-center justify-center rounded-full font-black text-white ${outline} ${sizeClass} ${
        isDigit ? "tracking-tight" : ""
      } ${className}`.trim()}
    >
      {letter}
    </span>
  );
}
