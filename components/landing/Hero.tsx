"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import Navbar from "./Navbar";

const KINETIC_RADIUS = 90;

export default function Hero() {
  const teachLetters = [..."Teach everything."];
  const teachRef = useRef<HTMLSpanElement>(null);

  function handleTeachMouseMove(e: React.MouseEvent<HTMLSpanElement>) {
    const container = teachRef.current;
    if (!container) return;
    const letters = container.querySelectorAll<HTMLElement>(".landing-kinetic-letter");
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(e.clientX - center);
      const strength = Math.max(0, 1 - distance / KINETIC_RADIUS);
      letter.style.setProperty("--kinetic-y", `${-16 * strength}px`);
      letter.style.setProperty("--kinetic-s", `${1 + 0.25 * strength}`);
    });
  }

  function handleTeachMouseLeave() {
    const container = teachRef.current;
    if (!container) return;
    container.querySelectorAll<HTMLElement>(".landing-kinetic-letter").forEach((letter) => {
      letter.style.setProperty("--kinetic-y", "0px");
      letter.style.setProperty("--kinetic-s", "1");
    });
  }

  return (
    <header className="relative flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col justify-center px-6 pb-10 pt-16 sm:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="relative z-[3] mx-auto max-w-[960px] text-center">
            <h1
              id="hero-headline"
              className="text-[38px] font-extrabold leading-[1.08] tracking-tight sm:text-[56px] lg:text-[72px]"
              style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
            >
              <span className="block">Learn anything.</span>
              <span
                ref={teachRef}
                onMouseMove={handleTeachMouseMove}
                onMouseLeave={handleTeachMouseLeave}
                className="relative mt-1 inline-block"
                style={{ color: "var(--neu-indigo)" }}
              >
                {teachLetters.map((ch, i) => (
                  <span
                    key={i}
                    className="landing-kinetic-letter"
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
              <span className="landing-pill landing-pill-yellow">real people</span>{" "}
              to trade what you know for what you want to learn.{" "}
              <span className="landing-pill landing-pill-white">No money</span>{" "}
              — just{" "}
              <span className="landing-pill landing-pill-white-2">pure skill exchange</span>
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
