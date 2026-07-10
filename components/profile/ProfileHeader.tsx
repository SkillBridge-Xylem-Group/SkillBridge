"use client";

import { useState } from "react";
import { Pencil, Calendar, Clock, Check, X } from "lucide-react";

type ProfileHeaderProps = {
  fullname: string;
  memberSince: string;
  timezone: string;
  bio: string | null;
  onSaveBio: (bio: string) => void;
};

export default function ProfileHeader({ fullname, memberSince, timezone, bio, onSaveBio }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftBio, setDraftBio] = useState(bio ?? "");

  function startEdit() {
    setDraftBio(bio ?? "");
    setIsEditing(true);
  }

  function save() {
    onSaveBio(draftBio.trim());
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
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-light text-3xl font-extrabold text-brand">
            {initials}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{fullname}</h1>
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
            Edit Bio
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
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                className="btn-pill flex items-center gap-1.5 bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dark"
              >
                <Check size={14} />
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-pill flex items-center gap-1.5 border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
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