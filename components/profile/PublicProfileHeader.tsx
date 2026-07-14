import { Calendar, Clock } from "lucide-react";
import PublicProfileActions from "./PublicProfileActions";

type PublicProfileHeaderProps = {
  fullname: string;
  memberSince: string;
  timezone: string;
  bio: string | null;
};

export default function PublicProfileHeader({ fullname, memberSince, timezone, bio }: PublicProfileHeaderProps) {
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

        <div className="w-full sm:w-56">
          <PublicProfileActions fullname={fullname} />
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-sm leading-relaxed text-slate-600">{bio || "This user hasn't added a bio yet."}</p>
      </div>
    </div>
  );
}
