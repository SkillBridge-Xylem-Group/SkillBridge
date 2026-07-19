"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import { TIER_STYLE, ICON_MAP, DEFAULT_ICON, type BadgeTier, type EvaluatedBadge } from "@/lib/badges";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatAppDate } from "@/lib/i18n/locales";

type AchievementsCardProps = {
  badges: EvaluatedBadge[];
};

export default function AchievementsCard({ badges }: AchievementsCardProps) {
  const { dictionary } = useLocale();
  const p = dictionary.profile;
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const overallPct = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  return (
    <div className="nb-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--sb-gradient)" }}
          >
            <Trophy size={20} />
          </div>
          <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
            {p.achievements}
          </h2>
        </div>

        <div
          className="rounded-full px-3 py-1.5 text-sm font-extrabold"
          style={{ background: "var(--sb-emerald-light)", color: "var(--sb-emerald-dark)" }}
        >
          {interpolate(p.unlockedCount, { n: unlockedCount, total: badges.length })}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "#e5f3ea" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--sb-gradient)" }}
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge, i) => (
          <BadgeTile key={badge.id} badge={badge} index={i} />
        ))}
      </div>
    </div>
  );
}

function BadgeTile({ badge, index }: { badge: EvaluatedBadge; index: number }) {
  const { locale, dictionary } = useLocale();
  const p = dictionary.profile;
  const [hovered, setHovered] = useState(false);
  const tier = TIER_STYLE[badge.tier];
  const Icon = ICON_MAP[badge.icon] ?? DEFAULT_ICON;

  const tierLabels: Record<BadgeTier, string> = {
    common: p.tierCommon,
    rare: p.tierRare,
    epic: p.tierEpic,
    legendary: p.tierLegendary,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4, scale: 1.03 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="nb-card-sm relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center"
      style={{
        boxShadow: badge.unlocked
          ? `0 0 0 1px ${tier.ring}, var(--sb-shadow-sm)`
          : "var(--sb-shadow-sm)",
      }}
    >
      {badge.unlocked && badge.tier === "legendary" && <ShineSweep />}

      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: badge.unlocked ? tier.gradient : "#e9edf1",
          boxShadow: badge.unlocked ? `0 8px 20px ${tier.glow}` : "none",
        }}
      >
        <Icon size={26} color={badge.unlocked ? "#ffffff" : "#9ca3af"} strokeWidth={2.25} />
        {!badge.unlocked && (
          <div
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white"
            style={{ background: "#6b7280" }}
          >
            <Lock size={12} color="#ffffff" />
          </div>
        )}
      </div>

      {badge.unlocked && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
          style={{ background: tier.chipBg, color: tier.chipInk }}
        >
          {tierLabels[badge.tier]}
        </span>
      )}

      <p
        className="text-sm font-extrabold leading-tight nb-heading"
        style={{ color: badge.unlocked ? "var(--sb-ink)" : "#6b7280" }}
      >
        {badge.name}
      </p>

      {badge.unlocked ? (
        <p className="text-xs" style={{ color: "var(--sb-muted)" }}>
          {badge.unlockedAt
            ? formatAppDate(badge.unlockedAt, locale, { month: "short", year: "numeric" })
            : p.unlocked}
        </p>
      ) : (
        <>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#e5e7eb" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${badge.progressPct}%`, background: "var(--sb-gradient)" }}
            />
          </div>
          <p className="text-xs font-semibold" style={{ color: "var(--sb-muted)" }}>
            {badge.current}/{badge.target}
          </p>
        </>
      )}

      {hovered && !badge.unlocked && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl px-2 py-1.5 text-[11px] font-medium text-white"
          style={{ background: "rgba(31, 41, 55, 0.92)" }}
        >
          {badge.description}
        </motion.div>
      )}
    </motion.div>
  );
}

function ShineSweep() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
      }}
      initial={{ x: "-120%" }}
      animate={{ x: "120%" }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
    />
  );
}
