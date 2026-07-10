export type AvatarOption = {
  id: string;
  emoji: string;
  label: string;
  bg: string;
};

// No custom illustration assets exist yet, so avatars are emoji-based.
// Every option below uses a front-facing "face" emoji (looking at the
// viewer) rather than a side-profile "body" glyph — llama/horse/sheep/goat
// only exist as side-profile glyphs in Unicode, so those were swapped for
// animals that do have a front-facing version.
// The picked id is persisted in profiles.avatar_url (e.g. "cat") and mapped
// back to its emoji/color at render time via getAvatarOption.
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "cat", emoji: "🐱", label: "Cat", bg: "bg-orange-100" },
  { id: "dog", emoji: "🐶", label: "Dog", bg: "bg-amber-100" },
  { id: "panda", emoji: "🐼", label: "Panda", bg: "bg-slate-100" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit", bg: "bg-pink-100" },
  { id: "cow", emoji: "🐮", label: "Cow", bg: "bg-rose-100" },
  { id: "tiger", emoji: "🐯", label: "Tiger", bg: "bg-yellow-100" },
  { id: "koala", emoji: "🐨", label: "Koala", bg: "bg-gray-100" },
  { id: "fox", emoji: "🦊", label: "Fox", bg: "bg-lime-100" },
];

export function getAvatarOption(id: string | null | undefined): AvatarOption | null {
  return AVATAR_OPTIONS.find((option) => option.id === id) ?? null;
}
