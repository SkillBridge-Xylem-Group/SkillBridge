import type { SupabaseClient } from "@supabase/supabase-js";

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "user";
}

/** Appends -2, -3, ... to the base slug until it finds one not already in `users`. */
export async function generateUniqueSlug(supabase: SupabaseClient, name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data } = await supabase.from("users").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}
