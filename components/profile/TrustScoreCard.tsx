"use client";

import { ShieldCheck, Info } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type TrustScoreCardProps = {
  trustScore: number | null;
  reviewCount?: number;
};

export default function TrustScoreCard({ trustScore, reviewCount }: TrustScoreCardProps) {
  const { dictionary } = useLocale();
  const p = dictionary.profile;

  return (
    <div className="nb-card-sm p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--sb-teal)" }}
        >
          <ShieldCheck size={20} />
        </div>
        <h2 className="flex items-center gap-1.5 text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
          {p.trustScore}
          <Info size={14} style={{ color: "var(--sb-muted)" }} />
        </h2>
      </div>

      <p className="mt-4 flex items-baseline gap-2 text-4xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
        {trustScore != null ? trustScore.toFixed(1) : "—"}
        {trustScore != null && reviewCount != null && (
          <span className="text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
            {interpolate(reviewCount === 1 ? p.reviewCountOne : p.reviewCountMany, { n: reviewCount })}
          </span>
        )}
      </p>

      {trustScore == null && (
        <>
          <p className="mt-2 text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>{p.noRatingsYet}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>{p.trustNoRatingsHint}</p>
        </>
      )}
    </div>
  );
}
