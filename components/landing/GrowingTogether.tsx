"use client";

import { motion } from "framer-motion";
import { Rocket, Users, Heart } from "lucide-react";

const points = [
  { icon: Rocket, title: "New Platform", desc: "Just getting started" },
  { icon: Users, title: "Open to All", desc: "Join anytime" },
  { icon: Heart, title: "Community First", desc: "You shape the future" },
];

export default function GrowingTogether() {
  return (
    <section className="section-snap bg-white px-6 pb-16 sm:px-10">
      <motion.div
        className="mx-auto max-w-6xl rounded-3xl border border-blue-border bg-blue-wash/40 p-8 sm:p-10"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-brand-blue-deep sm:text-3xl">
              Growing Together,
              <br />
              Learning Together.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-charcoal">
              We&apos;re a new platform, and every connection makes our community stronger.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            {points.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="group flex items-center gap-3">
                  <Icon size={22} className="text-brand-blue transition-transform duration-300 ease-out group-hover:scale-110" />
                  <div>
                    <p className="text-sm font-medium text-carbon">{p.title}</p>
                    <p className="text-xs text-charcoal">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
