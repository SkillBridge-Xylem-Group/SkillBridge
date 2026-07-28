import Link from "next/link";
import { Layers, Building2, ArrowRight, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type ProfileStatsBannerProps = {
  fullname: string;
  avatarUrl: string | null;
  level: number;
  experiencePoints: number;
  trustScore: number | null;
  skillsSharedCount: number;
  communitiesCount: number;
};

const XP_PER_LEVEL = 20;

export default function ProfileStatsBanner({
  fullname,
  avatarUrl,
  level,
  experiencePoints,
  trustScore,
  skillsSharedCount,
  communitiesCount,
}: ProfileStatsBannerProps) {
  const xpIntoLevel = experiencePoints % XP_PER_LEVEL;
  const progress = Math.min(100, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100));

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-6 sm:p-8"
      style={{ background: "var(--sb-gradient)", boxShadow: "var(--sb-shadow-lg)" }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-white/70 text-xl sm:h-20 sm:w-20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullname} />}
            <AvatarFallback className="text-xl font-extrabold" style={{ background: "#ffffff", color: "var(--sb-emerald-dark)" }}>
              {getInitials(fullname) || "?"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">{fullname}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                Level {level}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                <Star size={12} className="fill-white text-white" />
                Reputation {trustScore != null ? trustScore.toFixed(1) : "—"}
              </span>
            </div>

            <div className="mt-3 w-56 max-w-full">
              <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
                <span>Progress to Level {level + 1}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-2 text-white">
            <Layers size={20} className="shrink-0 text-white/80" />
            <div>
              <p className="text-lg font-extrabold leading-tight sm:text-xl">{skillsSharedCount}</p>
              {/* "Listed" (not "Shared") to stay visually distinct from the
                  Skill Swaps stat below — Shared read as a near-duplicate
                  of Swaps even though they're different metrics. */}
              <p className="text-[11px] font-semibold text-white/80">Skills Listed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Building2 size={20} className="shrink-0 text-white/80" />
            <div>
              <p className="text-lg font-extrabold leading-tight sm:text-xl">{communitiesCount}</p>
              <p className="text-[11px] font-semibold text-white/80">Communities</p>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5"
            style={{ color: "var(--sb-emerald-dark)" }}
          >
            View Profile
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
