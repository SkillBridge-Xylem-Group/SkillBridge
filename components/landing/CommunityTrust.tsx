"use client";

import { ShieldCheck, Star, MessagesSquare } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: Star,
    title: "Session ratings",
    desc: "After each completed swap, both people can rate each other. Your Trust Score is the average of those ratings — nothing invented.",
  },
  {
    icon: MessagesSquare,
    title: "Written reviews",
    desc: "Optional comments appear on your profile so future partners can see real feedback from people you’ve swapped with.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent profile",
    desc: "Level, XP, and Trust Score on your profile update from completed sessions and ratings on the platform.",
  },
];

export default function CommunityTrust() {
  return (
    <section id="community" className="section-snap bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-brand-blue">Built on real feedback</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">
            A Community Built on Trust &amp; Respect
          </h2>
          <p className="mt-3 text-charcoal">
            Trust Score reflects ratings you earn from completed skill swaps — not demo numbers.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                className="card p-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-wash text-brand-blue">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-carbon">{p.title}</h3>
                <p className="mt-2 text-sm text-charcoal">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
