"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

type OrbitSkill = { icon: string; bg: string; color?: string };

const OUTER_SKILLS: OrbitSkill[] = [
  { icon: "🎨", bg: "var(--neu-yellow)" },
  { icon: "🎵", bg: "var(--neu-coral)", color: "#fff" },
  { icon: "💻", bg: "#fff" },
  { icon: "🎸", bg: "var(--neu-teal)" },
  { icon: "🍳", bg: "var(--neu-purple)", color: "#fff" },
  { icon: "🗣️", bg: "var(--neu-indigo)", color: "#fff" },
  { icon: "✍️", bg: "var(--neu-orange)" },
  { icon: "📈", bg: "#fff" },
];

const INNER_SKILLS: OrbitSkill[] = [
  { icon: "🔬", bg: "var(--neu-teal)" },
  { icon: "🧘", bg: "var(--neu-yellow)" },
  { icon: "💃", bg: "var(--neu-coral)", color: "#fff" },
  { icon: "➗", bg: "#fff" },
  { icon: "📸", bg: "var(--neu-purple)", color: "#fff" },
  { icon: "🎤", bg: "var(--neu-indigo)", color: "#fff" },
];

type OrbitItem = {
  el: HTMLDivElement;
  baseAngle: number;
  radiusPct: number;
  degPerMs: number;
  hovered: boolean;
  freezeAt?: number;
};

/** Two rings of skill icons orbiting a central hub, each ring at its own speed/direction. */
export default function SkillsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items: OrbitItem[] = [];

    function place(item: OrbitItem, now: number) {
      const angle = item.baseAngle + item.degPerMs * (item.hovered ? (item.freezeAt ??= now) : now);
      if (!item.hovered) item.freezeAt = undefined;
      const rad = (angle * Math.PI) / 180;
      const x = 50 + item.radiusPct * Math.cos(rad);
      const y = 50 + item.radiusPct * Math.sin(rad);
      item.el.style.left = `${x}%`;
      item.el.style.top = `${y}%`;
    }

    function layoutRing(selector: string, radiusPct: number, degPerMs: number) {
      const nodes = container!.querySelectorAll<HTMLDivElement>(selector);
      const count = nodes.length;
      nodes.forEach((el, i) => {
        const baseAngle = (360 / count) * i - 90;
        const item: OrbitItem = { el, baseAngle, radiusPct, degPerMs, hovered: false };
        el.addEventListener("mouseenter", () => {
          item.hovered = true;
          el.style.transform = "translate(-50%, -50%) scale(1.2)";
          el.style.zIndex = "3";
        });
        el.addEventListener("mouseleave", () => {
          item.hovered = false;
          el.style.transform = "translate(-50%, -50%) scale(1)";
          el.style.zIndex = "1";
        });
        place(item, performance.now());
        items.push(item);
      });
    }

    layoutRing("[data-orbit='outer']", 50, 360 / 70000);
    layoutRing("[data-orbit='inner']", 31, -360 / 50000);

    let frameId: number;
    function tick(now: number) {
      items.forEach((item) => place(item, now));
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="overflow-hidden py-16">
      <Reveal className="mx-auto mb-4 max-w-[640px] px-6 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold"
          style={{
            fontFamily: "var(--font-playful)",
            background: "var(--neu-teal)",
            border: "2.5px solid var(--neu-ink)",
            boxShadow: "3px 3px 0 var(--neu-ink)",
            color: "var(--neu-ink)",
            transform: "rotate(-3deg)",
          }}
        >
          ✨ Free Website
        </span>
        <h2
          className="mt-4 text-[28px] font-extrabold tracking-tight sm:text-[40px]"
          style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
        >
          Choose skills that you want to learn
        </h2>
      </Reveal>

      <div
        ref={containerRef}
        className="relative mx-auto mt-6 aspect-square w-[92vw] max-w-[560px] sm:max-w-[400px] lg:max-w-[560px]"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px dashed rgba(15,31,22,.18)", animation: "orbitSpin 70s linear infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{ inset: "19%", border: "2px dashed rgba(15,31,22,.18)", animation: "orbitSpin 50s linear infinite reverse" }}
        />

        <div
          className="absolute left-1/2 top-1/2 z-[2] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl font-extrabold text-white"
          style={{
            fontFamily: "var(--font-playful)",
            background: "var(--neu-indigo)",
            border: "2.5px solid var(--neu-ink)",
            boxShadow: "6px 6px 0 var(--neu-ink)",
          }}
        >
          S
        </div>

        {OUTER_SKILLS.map((s, i) => (
          <div
            key={`outer-${i}`}
            data-orbit="outer"
            className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl transition-transform duration-200"
            style={{
              background: s.bg,
              color: s.color ?? "var(--neu-ink)",
              border: "2.5px solid var(--neu-ink)",
              boxShadow: "4px 4px 0 var(--neu-ink)",
              transform: "translate(-50%, -50%)",
            }}
          >
            {s.icon}
          </div>
        ))}

        {INNER_SKILLS.map((s, i) => (
          <div
            key={`inner-${i}`}
            data-orbit="inner"
            className="absolute flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl transition-transform duration-200"
            style={{
              background: s.bg,
              color: s.color ?? "var(--neu-ink)",
              border: "2.5px solid var(--neu-ink)",
              boxShadow: "4px 4px 0 var(--neu-ink)",
              transform: "translate(-50%, -50%)",
            }}
          >
            {s.icon}
          </div>
        ))}
      </div>
    </section>
  );
}
