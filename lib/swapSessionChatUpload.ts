import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const MAX_SESSION_CHAT_FILE_BYTES = 20 * 1024 * 1024; // 20MB

function safeFileName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120) || "file";
}

/**
 * Upload a session-chat file to Supabase Storage and return a signed download URL.
 * Requires the `session-chat` bucket + policies from supabase/session-chat-storage.sql.
 */
export async function uploadSessionChatFile(params: {
  requestId: string;
  userId: string;
  file: File;
}): Promise<
  | { ok: true; attachment: { name: string; mime: string; size: number; url: string } }
  | { ok: false; error: string }
> {
  const { requestId, userId, file } = params;

  if (file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_SESSION_CHAT_FILE_BYTES) {
    return { ok: false, error: "File is too large (max 20MB)." };
  }

  const supabase = createSupabaseBrowserClient();
  const unique = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${requestId}/${userId}/${unique}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("session-chat").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (uploadError) {
    console.error("[session-chat] upload failed:", uploadError);
    const hint =
      /bucket|not found|row-level security|policy/i.test(uploadError.message)
        ? " Storage bucket may not be set up yet (run supabase/session-chat-storage.sql)."
        : "";
    return { ok: false, error: `Upload failed.${hint}` };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("session-chat")
    .createSignedUrl(path, 60 * 60 * 24);

  if (signError || !signed?.signedUrl) {
    console.error("[session-chat] signed URL failed:", signError);
    return { ok: false, error: "Upload succeeded but download link could not be created." };
  }

  return {
    ok: true,
    attachment: {
      name: file.name || "file",
      mime: file.type || "application/octet-stream",
      size: file.size,
      url: signed.signedUrl,
    },
  };
}
