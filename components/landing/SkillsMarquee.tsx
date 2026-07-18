"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const skills = [
  "🎨 Design", "🎵 Music", "💻 Coding", "📸 Photography", "🍳 Cooking",
  "🗣️ Languages", "✍️ Writing", "📈 Business", "🔬 Science", "🧘 Yoga",
  "🎸 Guitar", "➗ Math", "💃 Dance", "🎤 Public Speaking",
];

const colors = ["var(--neu-yellow)", "var(--neu-coral)", "#fff", "var(--neu-teal)", "var(--neu-purple)", "var(--neu-indigo)"];
const textColors = ["var(--neu-ink)", "#fff", "var(--neu-ink)", "var(--neu-ink)", "#fff", "#fff"];

export default function SkillsMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let x = 0;
    let lastTime = performance.now();
    const speed = 0.045;
    let frameId: number;

    function tick(now: number) {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      x -= speed * dt;

      const setWidth = (track!.scrollWidth || 0) / 2;
      if (setWidth > 0) {
        if (x <= -setWidth) x += setWidth;
      }
      track!.style.transform = `translateX(${x}px)`;
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const set = (
    <div className="flex shrink-0 gap-4 pr-4">
      {skills.map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-base font-bold"
          style={{
            fontFamily: "var(--font-playful)",
            background: colors[i % colors.length],
            color: textColors[i % colors.length],
            border: "2.5px solid var(--neu-ink)",
            boxShadow: "3px 3px 0 var(--neu-ink)",
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );

  return (
    <section className="py-16">
      <Reveal className="mx-auto mb-10 max-w-[640px] text-center px-6">
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

      <div className="overflow-hidden bg-white py-6" style={{ borderTop: "3px solid var(--neu-ink)", borderBottom: "3px solid var(--neu-ink)" }}>
        <div ref={trackRef} className="flex w-max will-change-transform">
          {set}
          {set}
        </div>
      </div>
    </section>
  );
}
