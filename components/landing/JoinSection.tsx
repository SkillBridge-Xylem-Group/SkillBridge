"use client";

import { useEffect, useRef, useState } from "react";

const heading = "Join SkillBridge";
const confettiColors = ["var(--neu-yellow)", "var(--neu-coral)", "var(--neu-teal)", "var(--neu-purple)", "var(--neu-indigo)", "var(--neu-orange)", "#fff"];

export default function JoinSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(false);
  const firedConfetti = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || firedConfetti.current) return;
    firedConfetti.current = true;
    const headingDuration = heading.length * 35 + 450;

    const timer = setTimeout(() => {
      fireConfetti(headingRef.current);
    }, 500 + headingDuration);

    return () => clearTimeout(timer);
  }, [active]);

  return (
    <section id="join" ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 text-center sm:px-8">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <svg
          viewBox="0 0 1200 500"
          preserveAspectRatio="xMidYMid slice"
          className="-ml-[5%] block h-full w-[110%]"
          style={{ animation: "landingRibbonSway 9s ease-in-out infinite" }}
        >
          <path
            d="M -100,250 C 80,120 260,120 440,250 C 620,380 800,380 980,250 C 1160,120 1260,120 1350,200"
            fill="none"
            stroke="var(--neu-yellow)"
            strokeWidth={26}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />
        </svg>
      </div>

      <div className="relative z-[2] mx-auto max-w-[620px]">
        <h2
          ref={headingRef}
          className="text-[32px] font-extrabold tracking-tight sm:text-[46px]"
          style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)", perspective: "600px" }}
        >
          {[...heading].map((ch, i) => (
            <span
              key={i}
              className="inline-block transition-all duration-500"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "rotateX(0deg) translateY(0)" : "rotateX(90deg) translateY(6px)",
                transformOrigin: "50% 100%",
                transitionDelay: `${500 + i * 35}ms`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h2>

        <p className="mt-4 text-lg font-medium" style={{ color: "var(--neu-text-muted)" }}>
          Thousands of people are already teaching and learning every week. Your turn — sign up free, no credit card
          needed.
        </p>

        <a
          href="/register"
          className="mt-8 inline-flex rounded-2xl px-8 py-4 text-base font-bold transition hover:-translate-y-1"
          style={{
            fontFamily: "var(--font-playful)",
            background: "var(--neu-yellow)",
            color: "var(--neu-ink)",
            border: "3px solid var(--neu-ink)",
            boxShadow: "6px 6px 0 var(--neu-ink)",
          }}
        >
          Join for Free
        </a>
      </div>
    </section>
  );
}

function fireConfetti(targetEl: HTMLElement | null) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const pieceCount = 40;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 220;
    const cx = Math.cos(angle) * distance;
    const cy = Math.sin(angle) * distance * 0.7 + 80;

    piece.style.position = "fixed";
    piece.style.top = "0";
    piece.style.left = "0";
    piece.style.width = "9px";
    piece.style.height = "14px";
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "200";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.background = confettiColors[i % confettiColors.length];
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.setProperty("--cx", `${cx}px`);
    piece.style.setProperty("--cy", `${cy}px`);
    piece.style.setProperty("--cr", `${Math.random() * 720 - 360}deg`);
    piece.style.animation = `confettiBurst 1.3s ease-out forwards`;
    piece.style.animationDelay = `${Math.random() * 0.15}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}
