import { Calendar, Clock } from "lucide-react";
import ProfileUidMeta from "./ProfileUidMeta";
import PublicProfileActions from "./PublicProfileActions";

type PublicProfileHeaderProps = {
  fullname: string;
  publicUid: number | null;
  memberSince: string;
  memberSinceLabel: string;
  timezone: string;
  bio: string | null;
  noBioText: string;
  profileId: string;
};

export default function PublicProfileHeader({
  fullname,
  publicUid,
  memberSince,
  memberSinceLabel,
  timezone,
  bio,
  noBioText,
  profileId,
}: PublicProfileHeaderProps) {
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
          <div className="nb-avatar flex h-24 w-24 items-center justify-center text-3xl" style={{ background: "var(--sb-gradient)", color: "#fff" }}>
            {initials}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
              {fullname}
            </h1>
            <ProfileUidMeta publicUid={publicUid} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--sb-muted)" }}>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {memberSinceLabel} {memberSince}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {timezone}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-56">
          <PublicProfileActions fullname={fullname} profileId={profileId} />
        </div>
      </div>

      <div className="mt-5 pt-5" style={{ borderTop: "1px solid #eef7f0" }}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--sb-muted)" }}>{bio || noBioText}</p>
      </div>
    </div>
  );
}
