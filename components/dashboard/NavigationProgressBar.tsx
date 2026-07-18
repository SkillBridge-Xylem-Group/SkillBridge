"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationProgressBarProps = {
  /** True while a soft navigation is in flight (e.g. useTransition pending). */
  active?: boolean;
};

/**
 * Reddit-style thin top progress bar for client navigations.
 */
export default function NavigationProgressBar({ active = false }: NavigationProgressBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const prevRoute = useRef(routeKey);

  function clearTimers() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    tickTimers.current.forEach(clearTimeout);
    tickTimers.current = [];
  }

  function start() {
    clearTimers();
    setVisible(true);
    setWidth(8);
    tickTimers.current = [
      setTimeout(() => setWidth(28), 80),
      setTimeout(() => setWidth(52), 280),
      setTimeout(() => setWidth(72), 700),
      setTimeout(() => setWidth(86), 1400),
    ];
  }

  function finish() {
    clearTimers();
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 180);
  }

  // Drive from explicit pending state (sidebar navigate / transitions).
  useEffect(() => {
    if (active) start();
    else if (visible) finish();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to active flips
  }, [active]);

  // Also catch plain <Link> clicks inside the dashboard.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        // Same-app navigations only
        if (!url.pathname.startsWith("/dashboard") && !url.pathname.startsWith("/admin")) return;
        start();
      } catch {
        // ignore
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Complete when the route actually changes.
  useEffect(() => {
    if (prevRoute.current !== routeKey) {
      prevRoute.current = routeKey;
      if (visible || width > 0) finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  if (!visible && width === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden"
    >
      <div
        className="h-full origin-left rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.65)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%`, background: "var(--sb-gradient)" }}
      />
    </div>
  );
}
