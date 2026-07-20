export const REPORT_REASON_KEYS = [
  "spam",
  "harassment",
  "hate",
  "inappropriate",
  "misinformation",
  "other",
] as const;

export type ReportReasonKey = (typeof REPORT_REASON_KEYS)[number];

const LABELS_EN: Record<ReportReasonKey, string> = {
  spam: "Spam or advertising",
  harassment: "Harassment or bullying",
  hate: "Hate speech",
  inappropriate: "Inappropriate content",
  misinformation: "Misinformation",
  other: "Other",
};

export function isReportReasonKey(value: string): value is ReportReasonKey {
  return (REPORT_REASON_KEYS as readonly string[]).includes(value);
}

/** Build the stored reason string for the admin queue. */
export function composeReportReason(
  key: ReportReasonKey,
  details?: string
): { error: string | null; reason: string | null } {
  const extra = details?.trim() ?? "";
  const label = LABELS_EN[key];

  if (key === "other") {
    if (extra.length < 5) {
      return { error: "Please describe the violation (at least 5 characters).", reason: null };
    }
    if (extra.length > 500) {
      return { error: "Details are too long (max 500 characters).", reason: null };
    }
    return { error: null, reason: `Other: ${extra}` };
  }

  if (extra.length > 500) {
    return { error: "Details are too long (max 500 characters).", reason: null };
  }

  return { error: null, reason: extra ? `${label} — ${extra}` : label };
}
