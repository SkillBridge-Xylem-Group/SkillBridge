import { ShieldCheck, Info } from "lucide-react";

type TrustScoreCardProps = {
  // FR-014: average of all session ratings received; null until the first rating exists.
  trustScore: number | null;
  reviewCount?: number;
};

export default function TrustScoreCard({ trustScore, reviewCount }: TrustScoreCardProps) {
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
          Trust Score
          <Info size={14} style={{ color: "var(--sb-muted)" }} />
        </h2>
      </div>

      <p className="mt-4 flex items-baseline gap-2 text-4xl font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>
        {trustScore != null ? trustScore.toFixed(1) : "—"}
        {trustScore != null && reviewCount != null && (
          <span className="text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
            ({reviewCount} review{reviewCount === 1 ? "" : "s"})
          </span>
        )}
      </p>

      {trustScore == null && (
        <>
          <p className="mt-2 text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>No ratings yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>Complete your first swap to build your Trust Score.</p>
        </>
      )}
    </div>
  );
}