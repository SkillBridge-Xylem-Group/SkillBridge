const MIN_FORM_DURATION_MS = 2_000;

/** Reject honeypot fills and submissions that are too fast for a human. */
export function isSuspiciousSubmission(input: {
  website?: string;
  formStartedAt?: number;
}): boolean {
  if (input.website && input.website.trim().length > 0) {
    return true;
  }

  if (!input.formStartedAt || !Number.isFinite(input.formStartedAt)) {
    return true;
  }

  const elapsed = Date.now() - input.formStartedAt;
  return elapsed < MIN_FORM_DURATION_MS;
}
