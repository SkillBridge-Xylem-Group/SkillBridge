"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Hero() {
  const teachLetters = [..."Teach everything."];

  return (
    <header className="relative flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col justify-center px-6 pb-10 pt-16 sm:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide"
              style={{
                background: "#fff",
                border: "2.5px solid var(--neu-ink)",
                boxShadow: "4px 4px 0 var(--neu-ink)",
                color: "var(--neu-ink)",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[13px] text-white"
                style={{ background: "var(--neu-indigo)" }}
              >
                ✦
              </span>
              100% Free · Skill Swapping
            </span>
          </div>

          <div className="relative z-[3] mx-auto max-w-[960px] text-center">
            <h1
              className="text-[38px] font-extrabold leading-[1.08] tracking-tight sm:text-[56px] lg:text-[72px]"
              style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
            >
              <span className="block">Learn anything.</span>
              <span className="group relative mt-1 inline-block" style={{ color: "var(--neu-indigo)" }}>
                {teachLetters.map((ch, i) => (
                  <span
                    key={i}
                    className="inline-block transition-transform duration-300"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.transitionDelay = `${i * 20}ms`;
                      el.style.transform = "translateY(-14px) rotate(-8deg) scale(1.15)";
                      setTimeout(() => {
                        el.style.transform = "translateY(0) rotate(0deg) scale(1)";
                      }, 260);
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                ))}
                <span
                  className="absolute -bottom-1.5 left-[2%] right-[2%] -z-10 h-3 -rotate-1 rounded-full"
                  style={{ background: "var(--neu-yellow)" }}
                />
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[640px] text-base font-medium sm:text-lg" style={{ color: "var(--neu-text-muted)" }}>
              SkillBridge connects you with{" "}
              <span className="rounded-lg px-1.5 py-0.5 font-bold" style={{ background: "var(--neu-yellow)", color: "var(--neu-ink)" }}>
                real people
              </span>{" "}
              to trade what you know for what you want to learn.{" "}
              <span className="rounded-lg px-1.5 py-0.5 font-bold text-white" style={{ background: "var(--neu-coral)" }}>
                No money
              </span>{" "}
              — just{" "}
              <span className="rounded-lg px-1.5 py-0.5 font-bold text-white" style={{ background: "var(--neu-indigo)" }}>
                pure skill exchange
              </span>
              .
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="rounded-2xl px-7 py-4 text-base font-bold text-white transition hover:-translate-y-1"
                style={{
                  fontFamily: "var(--font-playful)",
                  background: "var(--neu-indigo)",
                  border: "3px solid var(--neu-ink)",
                  boxShadow: "6px 6px 0 var(--neu-ink)",
                }}
              >
                Start Swapping →
              </a>
              <a
                href="#showcase"
                className="rounded-2xl px-7 py-4 text-base font-bold transition hover:-translate-y-1"
                style={{
                  fontFamily: "var(--font-playful)",
                  background: "var(--neu-yellow)",
                  color: "var(--neu-ink)",
                  border: "3px solid var(--neu-ink)",
                  boxShadow: "6px 6px 0 var(--neu-ink)",
                }}
              >
                Browse Skills
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-14 hidden h-[150px] max-w-[760px] sm:block">
            <MatchCard
              className="left-[2%] top-0 -rotate-3"
              bg="var(--neu-coral)"
              emoji="🎨"
              name="Sofia M."
              meta={
                <>
                  Teaches <b>React</b> · Wants <b>Figma</b>
                </>
              }
            />
            <MatchCard
              className="right-[2%] top-[26px] rotate-2"
              bg="var(--neu-teal)"
              emoji="🎹"
              name="Kiran P."
              meta={
                <>
                  Teaches <b>Piano</b> · Wants <b>Spanish</b>
                </>
              }
            />
            <MatchCard
              className="left-[30%] top-[96px] -rotate-1"
              bg="var(--neu-yellow)"
              emoji="📊"
              name="Alex T."
              meta={
                <>
                  Teaches <b>Data Viz</b> · Wants <b>Cooking</b>
                </>
              }
            />
          </div>

          <a
            href="#showcase"
            className="mx-auto mt-10 flex w-fit animate-bounce text-2xl"
            style={{ color: "var(--neu-ink)" }}
            aria-label="Scroll down"
          >
            ↓
          </a>
        </div>
      </div>
    </header>
  );
}

function MatchCard({
  className,
  bg,
  emoji,
  name,
  meta,
}: {
  className: string;
  bg: string;
  emoji: string;
  name: string;
  meta: ReactNode;
}) {
  return (
    <div
      className={`absolute flex items-center gap-3 whitespace-nowrap rounded-2xl bg-white px-5 py-3.5 text-sm ${className}`}
      style={{ border: "2.5px solid var(--neu-ink)", boxShadow: "6px 6px 0 var(--neu-ink)" }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: bg, border: "2px solid var(--neu-ink)" }}
      >
        {emoji}
      </span>
      <span>
        <span className="block font-bold" style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}>
          {name}
        </span>
        <span className="font-medium" style={{ color: "var(--neu-text-muted)" }}>
          {meta}
        </span>
      </span>
    </div>
  );
}
