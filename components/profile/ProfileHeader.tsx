"use client";

import { useRef, useState } from "react";
import { Pencil, Calendar, Clock, Check, X, Plus } from "lucide-react";
import ProfileUidMeta from "./ProfileUidMeta";
import { uploadAvatar } from "@/lib/avatarUpload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatAppDate } from "@/lib/i18n/locales";

type ProfileHeaderProps = {
  userId: string;
  publicUid: number | null;
  fullname: string;
  createdAt: string;
  timezone: string;
  bio: string | null;
  avatarUrl: string | null;
  onSaveProfile: (name: string, bio: string) => Promise<void>;
  onAvatarChange: (nextUrl: string) => Promise<void>;
  profileError: string;
};

export default function ProfileHeader({
  userId,
  publicUid,
  fullname,
  createdAt,
  timezone,
  bio,
  avatarUrl,
  onSaveProfile,
  onAvatarChange,
  profileError,
}: ProfileHeaderProps) {
  const { locale, dictionary } = useLocale();
  const p = dictionary.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(fullname);
  const [draftBio, setDraftBio] = useState(bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraftName(fullname);
    setDraftBio(bio ?? "");
    setPhotoError("");
    setIsEditing(true);
  }

  async function save() {
    setIsSaving(true);
    await onSaveProfile(draftName.trim(), draftBio.trim());
    setIsSaving(false);
    setIsEditing(false);
  }

  async function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError("");
    setIsUploadingPhoto(true);
    try {
      const result = await uploadAvatar({ userId, file });
      if (!result.ok) {
        setPhotoError(result.error);
        return;
      }
      await onAvatarChange(result.url);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const initials = fullname
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="nb-card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar className="nb-avatar h-24 w-24 text-3xl">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullname} />}
              <AvatarFallback style={{ background: "var(--sb-gradient)", color: "#fff" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditing ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickPhoto(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  aria-label={p.changePhoto}
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white disabled:opacity-60"
                  style={{ background: "var(--sb-gradient)", color: "#fff", boxShadow: "var(--sb-shadow-sm)" }}
                >
                  <Plus size={13} strokeWidth={3} />
                </button>
              </>
            ) : null}
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={p.yourName}
                className="nb-input px-3 py-1.5 text-2xl font-extrabold nb-heading"
              />
            ) : (
              <h1 className="text-2xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
                {fullname}
              </h1>
            )}
            <ProfileUidMeta publicUid={publicUid} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--sb-muted)" }}>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {p.memberSince} {formatAppDate(createdAt, locale, { month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {timezone}
              </span>
            </div>
            {isEditing && isUploadingPhoto && (
              <p className="mt-1.5 text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>{p.uploadingPhoto}</p>
            )}
            {isEditing && photoError && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{photoError}</p>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="nb-btn flex items-center gap-1.5 self-start bg-white px-4 py-2 text-sm"
            style={{ color: "var(--sb-ink)" }}
          >
            <Pencil size={14} />
            {p.editProfile}
          </button>
        )}
      </div>

      <div className="mt-5 pt-5" style={{ borderTop: "1px solid #eef7f0" }}>
        {isEditing ? (
          <div>
            <textarea
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder={p.bioPlaceholder}
              className="nb-input w-full resize-none p-3 text-sm"
            />
            {profileError && <p className="mt-2 text-sm font-medium text-red-600">{profileError}</p>}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="nb-btn flex items-center gap-1.5 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "var(--sb-gradient)" }}
              >
                <Check size={14} />
                {isSaving ? p.saving : p.saveProfile}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoError("");
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="nb-btn flex items-center gap-1.5 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "var(--sb-ink)" }}
              >
                <X size={14} />
                {dictionary.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: "var(--sb-muted)" }}>
            {bio || p.noBioHint}
          </p>
        )}
      </div>
    </div>
  );
}
