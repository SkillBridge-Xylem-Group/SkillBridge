"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

export default function Showcase() {
  const statRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = statRef.current;
    if (!node) return;
    let animated = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated) return;
        animated = true;
        const duration = 1400;
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * 100));
          if (progress < 1) requestAnimationFrame(tick);
          else setCount(100);
        }
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="showcase" className="flex min-h-screen items-center px-6 py-16 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-10 text-center">
        <Reveal>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide"
            style={{ background: "#fff", border: "2.5px solid var(--neu-ink)", boxShadow: "4px 4px 0 var(--neu-ink)", color: "var(--neu-ink)" }}
          >
            🖥️ Live Preview
          </span>
          <h2
            className="mt-5 text-[28px] font-extrabold tracking-tight sm:text-[40px]"
            style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
          >
            Your gateway to learn more
          </h2>
        </Reveal>

        <Reveal className="w-full">
          <div
            className="mx-auto w-full max-w-[820px] overflow-hidden rounded-[20px] bg-white"
            style={{ border: "3px solid var(--neu-ink)", boxShadow: "8px 8px 0 var(--neu-ink)" }}
          >
            <div
              className="flex items-center gap-3.5 px-4 py-3"
              style={{ borderBottom: "3px solid var(--neu-ink)", background: "#f6f3fb" }}
            >
              <div className="flex gap-1.5">
                <span className="block h-3 w-3 rounded-full" style={{ background: "var(--neu-coral)", border: "2px solid var(--neu-ink)" }} />
                <span className="block h-3 w-3 rounded-full" style={{ background: "var(--neu-yellow)", border: "2px solid var(--neu-ink)" }} />
                <span className="block h-3 w-3 rounded-full" style={{ background: "var(--neu-teal)", border: "2px solid var(--neu-ink)" }} />
              </div>
              <div
                className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold"
                style={{ border: "2px solid var(--neu-ink)", color: "var(--neu-text-muted)" }}
              >
                🔒 skillbridge.my.id
              </div>
            </div>
            <div
              className="flex min-h-[280px] items-center justify-center p-8 sm:min-h-[320px]"
              style={{ background: "linear-gradient(160deg,#fff,#f5f1fd)" }}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {["🎨", "💻", "🎵", "📸"].map((emoji) => (
                  <span
                    key={emoji}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: "#fff", border: "2.5px solid var(--neu-ink)", boxShadow: "4px 4px 0 var(--neu-ink)" }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="max-w-[640px]">
          <p
            className="text-xl font-bold leading-snug sm:text-2xl"
            style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
          >
            &ldquo;Everyone is a teacher. Everyone is a student. You don&apos;t need money to grow — just something to
            give.&rdquo;
          </p>
          <span className="mt-4 block text-sm font-semibold" style={{ color: "var(--neu-text-muted)" }}>
            The SkillBridge Philosophy
          </span>
          <div ref={statRef} className="mt-8 flex justify-center">
            <div>
              <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-playful)", color: "var(--neu-indigo)" }}>
                {count}
              </div>
              <div className="text-[13px] font-semibold" style={{ color: "var(--neu-text-muted)" }}>
                % Free
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
