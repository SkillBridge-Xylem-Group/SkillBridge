"use client";

import { motion } from "framer-motion";
import { UserPlus, Handshake, BookOpen } from "lucide-react";

const reasons = [
  {
    icon: UserPlus,
    title: "Create your profile",
    desc: "List skills you can teach and skills you want to learn — matching is based on those choices.",
  },
  {
    icon: Handshake,
    title: "Send a swap request",
    desc: "Reach out to people whose skills complement yours. Accept, schedule, and complete sessions together.",
  },
  {
    icon: BookOpen,
    title: "Grow with the community",
    desc: "Earn XP for completed teaching sessions, read real reviews on profiles, and join the forum when you need help.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-snap bg-white pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-brand-blue">Why SkillBridge</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">
            From profile to your first swap
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-charcoal">
            Everything on SkillBridge is driven by real accounts, skills, and sessions.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                className="card p-6 text-left"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-wash text-brand-blue">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-carbon">{r.title}</h3>
                <p className="mt-2 text-sm text-charcoal">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
