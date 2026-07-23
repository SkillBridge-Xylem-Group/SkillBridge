import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeAvatarUrl } from "@/lib/avatar";

export type ViewerProfile = {
  fullname: string;
  avatarUrl: string | null;
};

export async function getViewerProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ViewerProfile> {
  const { data } = await supabase
    .from("users")
    .select("fullname, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  return {
    fullname: data?.fullname?.trim() || "there",
    avatarUrl: normalizeAvatarUrl(data?.avatar_url ?? null),
  };
}
