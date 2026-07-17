import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const MAX_FORUM_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function safeFileName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120) || "image";
}

/**
 * Upload a forum post image to the public `forum-images` bucket.
 * Requires supabase/forum-images-storage.sql.
 */
export async function uploadForumImage(params: {
  userId: string;
  file: File;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { userId, file } = params;

  if (file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_FORUM_IMAGE_BYTES) {
    return { ok: false, error: "Image is too large (max 10MB)." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, GIF, or WebP images are allowed." };
  }

  const supabase = createSupabaseBrowserClient();
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${unique}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("forum-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    console.error("[forum-images] upload failed:", uploadError);
    const hint = /bucket|not found|row-level security|policy/i.test(uploadError.message)
      ? " Storage may not be set up yet (run supabase/forum-images-storage.sql)."
      : "";
    return { ok: false, error: `Upload failed.${hint}` };
  }

  const { data } = supabase.storage.from("forum-images").getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, error: "Upload succeeded but public URL could not be created." };
  }

  return { ok: true, url: data.publicUrl };
}
