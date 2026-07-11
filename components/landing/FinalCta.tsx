"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section id="get-started" className="section-snap bg-white px-6 py-12 sm:px-10">
      <motion.div
        className="bg-brand-gradient relative mx-auto flex max-w-5xl flex-col items-center gap-8 overflow-hidden rounded-[28px] px-6 py-10 text-center sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:text-left"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-center lg:items-start">
          <p className="eyebrow text-white/80">Ready to get started?</p>

          <h2 className="mt-2 text-4xl font-medium tracking-tight text-white">
            Join SkillBridge Today
          </h2>
          <p className="mt-3 max-w-md text-base text-white/85">
            It&apos;s free, simple, and life-changing. Join a community trading knowledge, not cash.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-4 lg:justify-start">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-on-gradient gap-2 text-base"
            >
              Create free account
              <ArrowRight size={18} />
            </motion.a>
          </div>
        </div>

        {/* Genuinely transparent (alpha-matted white line art), so it sits
            directly on the gradient with no blend-mode needed. */}
        <Image
          src="/images/cta-runners.png"
          alt=""
          width={1195}
          height={689}
          className="pointer-events-none hidden w-48 shrink-0 opacity-90 sm:block lg:w-64"
        />
      </motion.div>
    </section>
  );
}
