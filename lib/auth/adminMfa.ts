import type { SupabaseClient } from "@supabase/supabase-js";

export async function adminHasVerifiedTotp(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    console.error("[admin-mfa] listFactors failed:", error.message);
    return false;
  }
  return (data?.totp ?? []).some((factor) => factor.status === "verified");
}

export async function adminNeedsMfaStep(supabase: SupabaseClient): Promise<boolean> {
  if (!(await adminHasVerifiedTotp(supabase))) return false;
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) {
    console.error("[admin-mfa] getAuthenticatorAssuranceLevel failed:", error.message);
    return true;
  }
  return data?.currentLevel !== "aal2";
}

export async function createAdminMfaChallenge(supabase: SupabaseClient): Promise<
  | { ok: true; factorId: string; challengeId: string }
  | { ok: false; error: string }
> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    return { ok: false, error: "Could not start two-factor verification." };
  }

  const factor = (data?.totp ?? []).find((entry) => entry.status === "verified");
  if (!factor) {
    return { ok: false, error: "Two-factor authentication is not set up." };
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: factor.id,
  });
  if (challengeError || !challenge) {
    return { ok: false, error: "Could not start two-factor verification." };
  }

  return { ok: true, factorId: factor.id, challengeId: challenge.id };
}
