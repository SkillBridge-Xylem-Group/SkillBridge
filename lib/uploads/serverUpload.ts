import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";
import { validateImageUpload, safeUploadFileName } from "@/lib/uploads/validateUpload";

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function readUploadFile(req: Request): Promise<File | null> {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  return file instanceof File ? file : null;
}

export async function uploadValidatedImage(params: {
  supabase: SupabaseClient;
  userId: string;
  buffer: Uint8Array;
  bucket: string;
  path: string;
  contentType: string;
  upsert?: boolean;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { supabase, bucket, path, contentType, buffer, upsert = false } = params;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    cacheControl: "3600",
    upsert,
    contentType,
  });

  if (uploadError) {
    console.error(`[upload/${bucket}] failed:`, uploadError.message);
    return { ok: false, error: "Upload failed." };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, error: "Upload succeeded but public URL could not be created." };
  }

  const url = upsert ? `${data.publicUrl}?v=${Date.now()}` : data.publicUrl;
  return { ok: true, url };
}

export async function handleAvatarUpload(req: Request) {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const file = await readUploadFile(req);
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const validated = validateImageUpload({
    buffer,
    maxBytes: MAX_AVATAR_BYTES,
    allowedMimes: ALLOWED_AVATAR_MIMES,
  });
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const path = `${user.id}/avatar.${validated.detected.ext}`;
  const uploaded = await uploadValidatedImage({
    supabase,
    userId: user.id,
    buffer,
    bucket: "avatars",
    path,
    contentType: validated.contentType,
    upsert: true,
  });

  if (!uploaded.ok) {
    return NextResponse.json({ error: uploaded.error }, { status: 500 });
  }

  return NextResponse.json({ url: uploaded.url });
}

export async function handleForumImageUpload(req: Request) {
  const { user, supabase, error: authError } = await requireActiveUser();
  if (authError) return authError;

  const file = await readUploadFile(req);
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const validated = validateImageUpload({
    buffer,
    maxBytes: 10 * 1024 * 1024,
    allowedMimes: new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  });
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const unique = crypto.randomUUID();
  const path = `${user.id}/${unique}-${safeUploadFileName(file.name, "image")}`;
  const uploaded = await uploadValidatedImage({
    supabase,
    userId: user.id,
    buffer,
    bucket: "forum-images",
    path,
    contentType: validated.contentType,
  });

  if (!uploaded.ok) {
    return NextResponse.json({ error: uploaded.error }, { status: 500 });
  }

  return NextResponse.json({ url: uploaded.url });
}
