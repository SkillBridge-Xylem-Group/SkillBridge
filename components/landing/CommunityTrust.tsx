"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";

// Placeholder example members for the "how trust looks" pattern — swap for
// real user data once more members have completed sessions and reviews.
const members = [
  { name: "Sarah", level: 7, offers: "JavaScript, React", wants: "UI/UX Design", score: "4.9", reviews: 18 },
  { name: "Ahmed", level: 6, offers: "Python, Data Analysis", wants: "Machine Learning", score: "4.8", reviews: 24 },
  { name: "Maya", level: 5, offers: "Marketing, SEO", wants: "Video Editing", score: "4.9", reviews: 15 },
  { name: "Lucas", level: 6, offers: "Photography", wants: "Spanish", score: "4.7", reviews: 9 },
];

export default function CommunityTrust() {
  return (
    <section id="community" className="section-snap bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow text-brand-blue">Real people. Real skills.</p>
            <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">
              A Community Built on Trust &amp; Respect
            </h2>
            <p className="mt-3 max-w-md text-charcoal">
              Every member has a Trust Score based on their reviews and interactions.
            </p>
            <a href="#testimonials" className="btn-secondary mt-5 inline-flex px-6 py-2.5 text-sm">
              Explore community
            </a>
          </motion.div>

          <div className="flex-1">
            <CardCarousel
              items={members}
              keyField={(m) => m.name}
              renderCard={(m) => (
                <div className="group card h-full p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-blue hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-carbon">{m.name}</p>
                    <span className="rounded-full bg-blue-wash px-2.5 py-1 text-[11px] font-medium text-brand-blue transition-transform duration-300 ease-out group-hover:scale-105">
                      Level {m.level}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-brand-green">Offers</p>
                  <p className="text-sm text-carbon">{m.offers}</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-brand-blue">Wants</p>
                  <p className="text-sm text-carbon">{m.wants}</p>
                  <div className="mt-4 flex items-center gap-1 border-t border-fog pt-3 text-xs">
                    <span className="text-charcoal">Trust Score</span>
                    <Star size={13} className="fill-gold text-gold" />
                    <span className="font-medium text-carbon">
                      {m.score} ({m.reviews})
                    </span>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
