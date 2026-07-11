"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface CardCarouselProps<T> {
  items: T[];
  keyField: (item: T) => string;
  renderCard: (item: T, index: number) => ReactNode;
  /** Tailwind width classes for each slide. Defaults suit ~4-per-row cards. */
  cardWidthClassName?: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Native scroll-snap carousel with real dot pagination (measured, not
 * hardcoded) and an arrow-key/drag-friendly track. No carousel library —
 * matches the rest of the site's plain-CSS-first approach. Cards cascade
 * in individually on scroll rather than the row fading in as one block.
 */
export function CardCarousel<T>({
  items,
  keyField,
  renderCard,
  cardWidthClassName = "w-64 shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]",
}: CardCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () =>
      setPageCount(Math.max(1, Math.round(track.scrollWidth / track.clientWidth)));

    measure();
    const onScroll = () => setActivePage(Math.round(track.scrollLeft / track.clientWidth));

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const goToPage = (page: number) => {
    trackRef.current?.scrollTo({ left: page * trackRef.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <motion.div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {items.map((item_, i) => (
          <motion.div key={keyField(item_)} variants={item} className={cardWidthClassName}>
            {renderCard(item_, i)}
          </motion.div>
        ))}
      </motion.div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              onClick={() => goToPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activePage ? "w-6 bg-brand-blue" : "w-2 bg-fog"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
