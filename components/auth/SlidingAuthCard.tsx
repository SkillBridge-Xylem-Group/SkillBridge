"use client";

import { useEffect, useRef, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

type Mode = "login" | "signup" | "reset";

function parseMode(value: string | undefined): Mode {
  return value === "signup" || value === "reset" ? value : "login";
}

type SlidingAuthCardProps = {
  initialMode?: string;
  redirectTo?: string;
  urlError?: string;
  justLoggedOut?: boolean;
};

export default function SlidingAuthCard({ initialMode, redirectTo, urlError, justLoggedOut }: SlidingAuthCardProps) {
  const [mode, setMode] = useState<Mode>(() => parseMode(initialMode));
  const cardRef = useRef<HTMLDivElement>(null);

  // Hover-to-switch on desktop only — meaningless on touch, and locked out
  // while the reset sub-panel is open (mirrors the reference mockup).
  useEffect(() => {
    if (mode === "reset") return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.innerWidth < 1024) return;

    const card = cardRef.current;
    if (!card) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = card!.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width;
      setMode((current) => {
        if (current === "reset") return current;
        if (xRatio < 0.5) return "signup";
        return "login";
      });
    }

    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, [mode]);

  return (
    <div className="auth-neu-page flex min-h-screen items-center justify-center p-4 sm:p-6">
      {/* Desktop: sliding two-panel card */}
      <div
        ref={cardRef}
        className="auth-neu-card relative hidden h-[650px] w-full max-w-[1100px] overflow-hidden rounded-[50px] lg:block"
      >
        <div
          className={`absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center px-12 transition-all duration-700 ${
            mode === "signup" ? "z-[5] scale-100 opacity-100" : "z-[1] scale-90 opacity-0"
          }`}
        >
          <RegisterForm onSwitchToLogin={() => setMode("login")} />
        </div>

        <div
          className={`absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center overflow-hidden px-12 transition-all duration-700 ${
            mode === "signup" ? "z-[1] scale-90 opacity-0" : "z-[2] scale-100 opacity-100"
          }`}
        >
          <div
            className={`flex w-full flex-col items-center transition-all duration-700 ${
              mode === "reset" ? "-translate-y-[120%] opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <LoginForm
              redirectTo={redirectTo}
              urlError={urlError}
              justLoggedOut={justLoggedOut}
              onForgotPassword={() => setMode("reset")}
              onSwitchToSignup={() => setMode("signup")}
            />
          </div>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-12 transition-all duration-700 ${
              mode === "reset" ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
            }`}
          >
            <ForgotPasswordForm onBackToLogin={() => setMode("login")} />
          </div>
        </div>

        <div
          className="absolute inset-y-0 left-0 z-10 flex w-1/2 flex-col items-center justify-center px-12 text-center text-white transition-transform duration-700"
          style={{ background: "var(--neu-grad)", transform: mode === "signup" ? "translateX(100%)" : "translateX(0)" }}
        >
          {mode === "signup" ? (
            <>
              <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-playful)" }}>Welcome Back!</h1>
              <p className="mt-4 max-w-xs text-sm text-white/90">
                Already have an account? Sign in to keep swapping skills with the community.
              </p>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="auth-neu-ghost-button mt-6 px-10 py-3 text-sm"
                style={{ background: "transparent", color: "white", boxShadow: "none", border: "2px solid rgba(255,255,255,0.6)" }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-playful)" }}>Hello Learner!</h1>
              <p className="mt-4 max-w-xs text-sm text-white/90">
                Enter your details and start your skill-swapping journey with SkillBridge.
              </p>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="auth-neu-ghost-button mt-6 px-10 py-3 text-sm"
                style={{ background: "transparent", color: "white", boxShadow: "none", border: "2px solid rgba(255,255,255,0.6)" }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile / touch: tabbed single-panel card, no hover interaction */}
      <div className="auth-neu-card-mobile w-full max-w-sm rounded-[32px] p-8 lg:hidden">
        {mode === "reset" ? (
          <ForgotPasswordForm onBackToLogin={() => setMode("login")} />
        ) : (
          <>
            <div
              className="mb-6 flex gap-1 rounded-full p-1"
              style={{ boxShadow: "inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)" }}
            >
              <button
                type="button"
                onClick={() => setMode("login")}
                className="flex-1 rounded-full py-2 text-sm font-medium transition"
                style={
                  mode === "login"
                    ? { background: "var(--neu-grad)", color: "white" }
                    : { color: "var(--neu-text-muted)" }
                }
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="flex-1 rounded-full py-2 text-sm font-medium transition"
                style={
                  mode === "signup"
                    ? { background: "var(--neu-grad)", color: "white" }
                    : { color: "var(--neu-text-muted)" }
                }
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <LoginForm
                redirectTo={redirectTo}
                urlError={urlError}
                justLoggedOut={justLoggedOut}
                onForgotPassword={() => setMode("reset")}
                onSwitchToSignup={() => setMode("signup")}
              />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode("login")} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
