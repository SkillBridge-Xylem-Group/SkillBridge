"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const steps = [
  {
    title: "Create Your Profile",
    desc: "Tell us what skills you have and what you're excited to learn.",
    bg: "var(--neu-yellow)",
    rotate: -2,
  },
  {
    title: "Share Your Skill",
    desc: "Show the community what you're great at, from coding to cooking.",
    bg: "var(--neu-coral)",
    rotate: 1.5,
    textWhite: true,
  },
  {
    title: "Find Your Swap Partner",
    desc: "Match with someone who has what you want — and wants what you have.",
    bg: "var(--neu-teal)",
    rotate: -1.5,
  },
  {
    title: "Live Session",
    desc: "Teach and learn face-to-face in a live video session — completely free.",
    bg: "var(--neu-purple)",
    rotate: 2,
    textWhite: true,
  },
];

/** Pops the card up into its tilted resting position (scale + rotate), not just a fade. */
function StepCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const restTransform = `translateY(0) scale(1) rotate(${step.rotate}deg)`;
  const hiddenTransform = `translateY(55px) scale(.85) rotate(${step.rotate}deg)`;

  return (
    <div
      ref={ref}
      className={`relative ${index % 2 === 1 ? "sm:mt-5" : ""}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? restTransform : hiddenTransform,
        transition: "opacity .6s ease, transform .55s cubic-bezier(.28,1.35,.4,1)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {/* Peeking stacked cards behind the main card — a little deck effect. */}
      <div
        className="absolute inset-0 rounded-3xl bg-white"
        style={{ border: "2.5px solid var(--neu-ink)", transform: `rotate(${step.rotate * 3.5}deg)`, zIndex: -2 }}
      />
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: step.bg, border: "2.5px solid var(--neu-ink)", transform: `rotate(${step.rotate * 4.5}deg)`, zIndex: -1 }}
      />

      <div
        className="h-full rounded-3xl bg-white p-7 transition hover:-translate-y-1"
        style={{ border: "2.5px solid var(--neu-ink)", boxShadow: "6px 6px 0 var(--neu-ink)" }}
      >
        <span
          className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-xl text-lg font-extrabold"
          style={{
            background: step.bg,
            color: step.textWhite ? "#fff" : "var(--neu-ink)",
            border: "2.5px solid var(--neu-ink)",
            fontFamily: "var(--font-playful)",
          }}
        >
          {index + 1}
        </span>
        <h3 className="text-[19px] font-bold" style={{ color: "var(--neu-ink)" }}>
          {step.title}
        </h3>
        <p className="mt-2 text-[15px]" style={{ color: "var(--neu-text-muted)" }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="flex min-h-screen items-center px-6 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <Reveal className="mx-auto mb-12 max-w-[640px] text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide"
            style={{ background: "#fff", border: "2.5px solid var(--neu-ink)", boxShadow: "4px 4px 0 var(--neu-ink)", color: "var(--neu-ink)" }}
          >
            ⓘ How it works
          </span>
          <h2
            className="mt-5 text-[28px] font-extrabold tracking-tight sm:text-[40px]"
            style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
          >
            Four steps to your next skill
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-9 p-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
