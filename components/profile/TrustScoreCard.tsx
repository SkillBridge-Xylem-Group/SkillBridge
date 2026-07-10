import { ShieldCheck, Info } from "lucide-react";

type TrustScoreCardProps = {
  // FR-014: average of all session ratings received; null until the first rating exists.
  trustScore: number | null;
};

export default function TrustScoreCard({ trustScore }: TrustScoreCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <ShieldCheck size={20} />
        </div>
        <h2 className="flex items-center gap-1.5 text-lg font-extrabold text-slate-900">
          Trust Score
          <Info size={14} className="text-slate-300" />
        </h2>
      </div>

      <p className="mt-4 text-4xl font-extrabold text-slate-900">
        {trustScore != null ? trustScore.toFixed(1) : "—"}
      </p>

      {trustScore == null && (
        <>
          <p className="mt-2 text-sm font-semibold text-slate-400">No ratings yet</p>
          <p className="mt-1 text-sm text-slate-500">Complete your first swap to build your Trust Score.</p>
        </>
      )}
    </div>
  );
}