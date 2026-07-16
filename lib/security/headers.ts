/**
 * Enterprise-oriented HTTP security headers for SkillBridge.
 * Applied via next.config.ts so they ship on every HTML/API response.
 */

function contentSecurityPolicy(): string {
  // Supabase Auth / Realtime / Storage, Google OAuth, Google Fonts, Unsplash.
  // 'unsafe-inline' / 'unsafe-eval' are required for Next.js App Router hydration
  // until a nonce-based CSP is wired through middleware; still blocks foreign origins.
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    [
      "img-src 'self' data: blob:",
      "https://images.unsplash.com",
      "https://*.supabase.co",
      "https://*.googleusercontent.com",
    ].join(" "),
    [
      "connect-src 'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://accounts.google.com",
      "https://api.pwnedpasswords.com",
    ].join(" "),
    "frame-src 'self' https://accounts.google.com https://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

export const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Allow Skill Swap sessions to request camera/mic on this origin only.
    // `camera=()` / `microphone=()` silently blocks getUserMedia with no browser prompt.
    key: "Permissions-Policy",
    value:
      "camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Allow Google OAuth redirects / popups while isolating other cross-origin windows.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];
