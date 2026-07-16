type Tone = "active" | "attention" | "info" | "neutral" | "critical";

const TONE_DOT: Record<Tone, string> = {
  active: "bg-brand-green",
  attention: "bg-status-attention",
  info: "bg-brand-blue",
  neutral: "bg-mid-gray",
  critical: "bg-status-critical",
};

type StatusDotProps = {
  tone: Tone;
  label: string;
};

export default function StatusDot({ tone, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}