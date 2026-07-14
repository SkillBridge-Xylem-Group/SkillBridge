import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  clearOAuthPkceStorage,
  createOAuthBrowserClient,
  markGoogleReauthRequired,
  revokeGoogleProviderToken,
} from "@/lib/supabase/oauth-client";

/** Remove leftover Supabase auth keys from localStorage / sessionStorage. */
function clearAllSupabaseWebStorage() {
  if (typeof window === "undefined") return;

  clearOAuthPkceStorage();

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      // Keep FORCE_GOOGLE_REAUTH_KEY — set after we finish gathering tokens.
      if (key === "skillbridge-force-google-reauth") continue;
      if (
        key.startsWith("sb-") ||
        key.includes("supabase.auth") ||
        key.startsWith("skillbridge-oauth")
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  }
}

/** Best-effort clear of non-httpOnly sb-* cookies from the document. */
function clearSupabaseDocumentCookies() {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const pairs = document.cookie ? document.cookie.split(";") : [];

  for (const pair of pairs) {
    const name = pair.split("=")[0]?.trim();
    if (!name || !name.startsWith("sb-")) continue;
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
}

/**
 * Full client logout: revoke Google grant, clear sessions, mark next Google
 * login as requiring re-authentication (no silent return to dashboard).
 */
export async function signOutEverywhere(): Promise<void> {
  let providerToken: string | null = null;

  try {
    const cookieClient = createSupabaseBrowserClient();
    const { data } = await cookieClient.auth.getSession();
    providerToken = data.session?.provider_token ?? null;
  } catch (err) {
    console.error("[signOut] getSession:", err);
  }

  // Next Google click must show login / account picker again.
  markGoogleReauthRequired();

  // Revoke Google access token so SSO cannot silently re-enter the app.
  await revokeGoogleProviderToken(providerToken);

  try {
    const cookieClient = createSupabaseBrowserClient();
    await cookieClient.auth.signOut({ scope: "local" });
  } catch (err) {
    console.error("[signOut] cookie client:", err);
  }

  try {
    const oauthClient = createOAuthBrowserClient();
    await oauthClient.auth.signOut({ scope: "local" });
  } catch (err) {
    console.error("[signOut] oauth client:", err);
  }

  clearAllSupabaseWebStorage();
  clearSupabaseDocumentCookies();

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[signOut] api:", err);
  }

  clearAllSupabaseWebStorage();
  clearSupabaseDocumentCookies();
  // Re-set after storage sweeps in case anything cleared it.
  markGoogleReauthRequired();
}
