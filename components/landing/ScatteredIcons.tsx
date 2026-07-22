"use client";

import { useEffect, useRef } from "react";

type Subject = {
  icon: string;
  bg: string;
  color: string;
  scatterDx: number;
  scatterDy: number;
  dx: number;
  dy: number;
};

const SUBJECTS: Subject[] = [
  { icon: "🧑🏽‍🎨", bg: "var(--neu-coral)", color: "#fff", scatterDx: -540, scatterDy: -20, dx: -90, dy: -30 },
  { icon: "👩🏻‍💻", bg: "var(--neu-yellow)", color: "var(--neu-ink)", scatterDx: 540, scatterDy: -20, dx: 90, dy: -30 },
  { icon: "🧑🏻‍🏫", bg: "var(--neu-teal)", color: "var(--neu-ink)", scatterDx: -580, scatterDy: 70, dx: -60, dy: 20 },
  { icon: "👨🏿‍🎤", bg: "#fff", color: "var(--neu-ink)", scatterDx: 580, scatterDy: 70, dx: 60, dy: 20 },
  { icon: "👩🏽‍🍳", bg: "var(--neu-orange)", color: "var(--neu-ink)", scatterDx: -460, scatterDy: 150, dx: -30, dy: -15 },
  { icon: "🧑🏼‍🔬", bg: "var(--neu-purple)", color: "#fff", scatterDx: 460, scatterDy: 150, dx: 30, dy: -15 },
  { icon: "👨🏻‍⚖️", bg: "#fff", color: "var(--neu-ink)", scatterDx: -400, scatterDy: -90, dx: -10, dy: 35 },
  { icon: "🧑🏾‍🚀", bg: "var(--neu-indigo)", color: "#fff", scatterDx: 400, scatterDy: -90, dx: 10, dy: 35 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Icons must never render above this line (px from top of viewport) —
// otherwise on shorter viewports they scatter up into/behind the sticky
// navbar. ~88px clears the navbar's height plus a small safety margin.
const MIN_ICON_TOP = 88;
// Keep icons at least this far from the left/right viewport edges.
const EDGE_MARGIN = 24;
const ICON_HALF_SIZE = 28;

/**
 * Decorative profile-avatar icons scattered around the hero headline on
 * hover, then travel (scroll-linked, no CSS transition) toward the
 * showcase browser mockup and dock into it once landed. Icons are plain
 * DOM nodes created and positioned imperatively — kept entirely outside
 * React's render cycle so reparenting them into the mockup on "dock"
 * doesn't fight React's own reconciliation.
 */
export default function ScatteredIcons() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const headlineEl = document.getElementById("hero-headline");
    if (!field || !headlineEl) return;

    const iconEls = SUBJECTS.map((s) => {
      const el = document.createElement("div");
      el.textContent = s.icon;
      Object.assign(el.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "56px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        borderRadius: "50%",
        border: "2.5px solid var(--neu-ink)",
        boxShadow: "4px 4px 0 var(--neu-ink)",
        background: s.bg,
        color: s.color,
        opacity: "0",
        willChange: "transform, opacity",
      });
      field.appendChild(el);
      return { el, data: s, docked: false };
    });

    let hovering = false;
    function handleEnter() {
      hovering = true;
      updateIcons();
    }
    function handleLeave() {
      hovering = false;
      updateIcons();
    }
    headlineEl.addEventListener("mouseenter", handleEnter);
    headlineEl.addEventListener("mouseleave", handleLeave);

    function dockIcon(item: (typeof iconEls)[number], hostRect: DOMRect, data: Subject) {
      const host = document.getElementById("browser-content");
      if (!host || item.docked) return;
      item.docked = true;
      item.el.style.transition = "none";
      item.el.style.position = "absolute";
      item.el.style.left = `${hostRect.width / 2 + data.dx - 28}px`;
      item.el.style.top = `${hostRect.height / 2 + data.dy - 28}px`;
      item.el.style.transform = "scale(.5)";
      item.el.style.opacity = "1";
      host.appendChild(item.el);
    }

    function updateIcons() {
      const hostEl = document.getElementById("browser-content");
      const hostRect = hostEl ? hostEl.getBoundingClientRect() : null;
      const headlineRect = headlineEl!.getBoundingClientRect();
      const originX = headlineRect.left + headlineRect.width / 2;
      const originY = headlineRect.top + headlineRect.height / 2;

      let progress = 0;
      if (hostRect) {
        const start = window.innerHeight;
        const end = window.innerHeight * 0.35;
        progress = (start - hostRect.top) / (start - end);
        progress = Math.max(0, Math.min(1, progress));
      }

      iconEls.forEach((item) => {
        if (item.docked) return;
        const { el, data } = item;
        const homeX = originX + data.scatterDx;
        const homeY = originY + data.scatterDy;
        const targetX = hostRect ? hostRect.left + hostRect.width / 2 + data.dx : homeX;
        const targetY = hostRect ? hostRect.top + hostRect.height / 2 + data.dy : homeY;

        let opacity: number;
        let x: number;
        let y: number;
        let scale: number;
        if (progress <= 0.02) {
          el.style.transition = "transform .7s cubic-bezier(.3,1.4,.4,1), opacity .45s ease";
          if (hovering) {
            x = Math.min(Math.max(homeX, EDGE_MARGIN + ICON_HALF_SIZE), window.innerWidth - EDGE_MARGIN - ICON_HALF_SIZE);
            y = Math.max(homeY, MIN_ICON_TOP);
            scale = 1;
            opacity = 1;
          } else {
            x = originX;
            y = originY;
            scale = 0.15;
            opacity = 0;
          }
        } else {
          el.style.transition = "opacity .2s ease";
          opacity = Math.min(1, progress / 0.55);
          x = lerp(homeX, targetX, progress);
          y = Math.max(lerp(homeY, targetY, progress), MIN_ICON_TOP);
          scale = lerp(1, 0.5, progress);
        }
        el.style.opacity = String(opacity);
        el.style.transform = `translate(${x - 28}px, ${y - 28}px) scale(${scale})`;

        if (hostRect && progress >= 1) {
          dockIcon(item, hostRect, data);
        }
      });
    }

    let ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateIcons();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    updateIcons();

    return () => {
      headlineEl.removeEventListener("mouseenter", handleEnter);
      headlineEl.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      iconEls.forEach((item) => item.el.remove());
    };
  }, []);

  return <div ref={fieldRef} className="pointer-events-none fixed inset-0 z-40 hidden min-[901px]:block" aria-hidden />;
}