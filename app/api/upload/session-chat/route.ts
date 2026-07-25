import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { readUploadFile } from "@/lib/uploads/serverUpload";
import { validateSessionChatUpload, safeUploadFileName } from "@/lib/uploads/validateUpload";

export const MAX_SESSION_CHAT_FILE_BYTES = 20 * 1024 * 1024;

const ALLOWED_SESSION_CHAT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "video/webm",
]);

export async function POST(req: Request) {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const requestId = formData?.get("requestId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof requestId !== "string" || !requestId.trim()) {
    return NextResponse.json({ error: "Session not found." }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("session_requests")
    .select("request_id")
    .eq("request_id", requestId.trim())
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "You can't upload to this session." }, { status: 403 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const declaredMime = file.type || "application/octet-stream";
  const validated = validateSessionChatUpload({
    buffer,
    maxBytes: MAX_SESSION_CHAT_FILE_BYTES,
    declaredMime,
    allowedMimes: ALLOWED_SESSION_CHAT_MIME,
  });
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const unique = crypto.randomUUID();
  const path = `${requestId.trim()}/${user.id}/${unique}-${safeUploadFileName(file.name, "file")}`;

  const { error: uploadError } = await supabase.storage.from("session-chat").upload(path, buffer, {
    cacheControl: "3600",
    upsert: false,
    contentType: validated.contentType,
  });

  if (uploadError) {
    console.error("[session-chat] upload failed:", uploadError.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("session-chat")
    .createSignedUrl(path, 60 * 60 * 24);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Upload succeeded but download link could not be created." }, { status: 500 });
  }

  return NextResponse.json({
    attachment: {
      name: file.name || "file",
      mime: validated.contentType,
      size: file.size,
      url: signed.signedUrl,
    },
  });
}
