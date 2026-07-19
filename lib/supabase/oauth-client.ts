import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const OAUTH_STORAGE_KEY = "skillbridge-oauth-pkce";
/** Set on logout so the next Google sign-in must re-authenticate. */
export const FORCE_GOOGLE_REAUTH_KEY = "skillbridge-force-google-reauth";

/**
 * Dedicated browser client for Google OAuth PKCE. Singleton for the same
 * reason as createSupabaseBrowserClient — reuse one GoTrueClient instead of
 * creating a fresh one on every call (this one's called from several forum
 * upload/composer components in addition to the auth flow itself).
 * Uses localStorage so the PKCE code verifier survives the redirect back
 * from Google (cookie storage often fails that round-trip).
 */
let oauthClient: SupabaseClient | undefined;

export function createOAuthBrowserClient(): SupabaseClient {
  if (oauthClient) return oauthClient;

  oauthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: OAUTH_STORAGE_KEY,
      },
    }
  );

  return oauthClient;
}

/** Clear stale PKCE/session keys so each Google login starts clean. */
export function clearOAuthPkceStorage() {
  if (typeof window === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(OAUTH_STORAGE_KEY)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export function markGoogleReauthRequired() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(FORCE_GOOGLE_REAUTH_KEY, "1");
}

export function clearGoogleReauthRequired() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(FORCE_GOOGLE_REAUTH_KEY);
}

function shouldForceGoogleReauth() {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(FORCE_GOOGLE_REAUTH_KEY) === "1";
}

/**
 * Best-effort revoke of the Google access token so the next sign-in cannot
 * silently reuse the previous OAuth grant.
 */
export async function revokeGoogleProviderToken(providerToken: string | null | undefined) {
  if (!providerToken) return;
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(providerToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  } catch (err) {
    console.error("[oauth] Google revoke failed:", err);
  }
}

/**
 * Start Google OAuth. After logout, forces Google account picker + re-login
 * so users cannot skip straight into the dashboard on a cached Google session.
 */
export async function startGoogleOAuth(): Promise<{ error: string | null }> {
  clearOAuthPkceStorage();

  const supabase = createOAuthBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback`;
  const forceReauth = shouldForceGoogleReauth();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        // Always show account picker; after logout also force Google re-login.
        prompt: forceReauth ? "login select_account" : "select_account",
        access_type: "offline",
        ...(forceReauth ? { max_age: "0" } : {}),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "Could not start Google sign-in. Please try again." };
  }

  // Supabase may not always preserve queryParams on the final URL — enforce them.
  const url = new URL(data.url);
  url.searchParams.set("prompt", forceReauth ? "login select_account" : "select_account");
  url.searchParams.set("access_type", "offline");
  if (forceReauth) {
    url.searchParams.set("max_age", "0");
  }

  // Keep FORCE_GOOGLE_REAUTH_KEY until a successful callback so cancel/retry
  // still requires Google re-login after logout.
  window.location.assign(url.toString());
  return { error: null };
}
