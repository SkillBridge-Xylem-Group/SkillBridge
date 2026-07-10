"use client";

import { useState } from "react";
import { Pencil, Calendar, Clock, Check, X } from "lucide-react";
import { AVATAR_OPTIONS, getAvatarOption } from "@/lib/avatars";

type ProfileHeaderProps = {
  fullname: string;
  memberSince: string;
  timezone: string;
  bio: string | null;
  onSaveProfile: (name: string, bio: string) => Promise<void>;
  profileError: string;
  avatarId: string | null;
  onSaveAvatar: (avatarId: string) => void;
};

export default function ProfileHeader({
  fullname,
  memberSince,
  timezone,
  bio,
  onSaveProfile,
  profileError,
  avatarId,
  onSaveAvatar,
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(fullname);
  const [draftBio, setDraftBio] = useState(bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedAvatar = getAvatarOption(avatarId);

  function startEdit() {
    setDraftName(fullname);
    setDraftBio(bio ?? "");
    setIsEditing(true);
  }

  async function save() {
    setIsSaving(true);
    await onSaveProfile(draftName.trim(), draftBio.trim());
    setIsSaving(false);
    setIsEditing(false);
  }

  const initials = fullname
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              aria-label="Change avatar"
              className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-extrabold transition hover:opacity-80 ${
                selectedAvatar ? selectedAvatar.bg : "bg-brand-light text-brand"
              }`}
            >
              {selectedAvatar ? <span className="text-4xl">{selectedAvatar.emoji}</span> : initials}
            </button>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-white">
              <Pencil size={12} />
            </span>

            {pickerOpen && (
              <div className="absolute left-0 top-28 z-10 w-64 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                <p className="mb-3 text-sm font-bold text-slate-900">Choose an avatar</p>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      title={option.label}
                      onClick={() => {
                        onSaveAvatar(option.id);
                        setPickerOpen(false);
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ring-2 transition ${
                        option.bg
                      } ${avatarId === option.id ? "ring-brand" : "ring-transparent hover:ring-slate-200"}`}
                    >
                      {option.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-2xl font-extrabold text-slate-900 focus:border-brand focus:outline-none"
              />
            ) : (
              <h1 className="text-2xl font-extrabold text-slate-900">{fullname}</h1>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Member since {memberSince}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {timezone}
              </span>
            </div>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        {isEditing ? (
          <div>
            <textarea
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Tell the community a bit about yourself..."
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:border-brand focus:outline-none"
            />
            {profileError && <p className="mt-2 text-sm font-medium text-red-600">{profileError}</p>}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="btn-pill flex items-center gap-1.5 bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={14} />
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="btn-pill flex items-center gap-1.5 border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">
            {bio || "Add a short bio so the community can get to know you."}
          </p>
        )}
      </div>
    </div>
  );
}