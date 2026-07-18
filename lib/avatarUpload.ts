import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Upload a profile photo to the public `avatars` bucket, overwriting any
 * previous photo at the same path. Requires supabase/avatars-storage.sql.
 */
export async function uploadAvatar(params: {
  userId: string;
  file: File;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { userId, file } = params;

  if (file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Image is too large (max 5MB)." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const supabase = createSupabaseBrowserClient();
  const path = `${userId}/avatar.${EXT_BY_TYPE[file.type]}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    console.error("[avatars] upload failed:", uploadError);
    const hint = /bucket|not found|row-level security|policy/i.test(uploadError.message)
      ? " Storage may not be set up yet (run supabase/avatars-storage.sql)."
      : "";
    return { ok: false, error: `Upload failed.${hint}` };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, error: "Upload succeeded but public URL could not be created." };
  }

  // Cache-bust so a re-upload at the same path shows immediately instead of
  // the browser/CDN serving the stale image from before.
  return { ok: true, url: `${data.publicUrl}?v=${Date.now()}` };
}
