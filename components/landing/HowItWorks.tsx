"use client";

import { motion, type Variants } from "framer-motion";
import { UserPlus, Search, Send, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Your Profile", desc: "Add the skills you can teach and the skills you want to learn.", tone: "green" },
  { icon: Search, title: "Find Skill Partners", desc: "Search by skills, interests, or experience level.", tone: "blue" },
  { icon: Send, title: "Send & Accept Requests", desc: "Connect with someone and plan your learning session.", tone: "blue" },
  { icon: CheckCircle2, title: "Learn & Grow Together", desc: "Share knowledge, help each other, and grow your skills.", tone: "green" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-snap bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-brand-blue">Simple steps</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">How SkillBridge Works</h2>
          <p className="mt-3 text-charcoal">Exchange skills in four simple steps.</p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isBlue = step.tone === "blue";
            return (
              <motion.div key={step.title} variants={item} className="group relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-9 hidden h-px w-full border-t border-dotted border-mid-gray/30 lg:block" />
                )}
                <div
                  className={`relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border transition-transform duration-300 ease-out group-hover:scale-110 ${
                    isBlue ? "border-blue-border icon-badge-blue" : "border-green-border icon-badge-green"
                  }`}
                >
                  <Icon size={26} />
                </div>
                <p className="mt-4 text-sm font-medium text-mid-gray">{i + 1}</p>
                <h3 className="mt-1 text-lg font-medium text-carbon">{step.title}</h3>
                <p className="mt-2 text-sm text-charcoal">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
