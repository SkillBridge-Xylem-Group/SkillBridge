"use client";

import { Repeat2, MessageSquareText, MessageCircle, Star, Award } from "lucide-react";
import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";

const features = [
  { icon: Repeat2, title: "Skill Exchange", desc: "Teach what you know, learn what you need.", tone: "blue" },
  { icon: MessageSquareText, title: "Community Forum", desc: "Ask questions, share tips, help others.", tone: "green" },
  { icon: MessageCircle, title: "Messaging", desc: "Chat and coordinate sessions easily.", tone: "blue" },
  { icon: Star, title: "Trust & Reviews", desc: "Build your reputation and earn trust.", tone: "green" },
  { icon: Award, title: "Levels & XP", desc: "Track your progress and level up.", tone: "blue" },
];

export default function FeatureGrid() {
  return (
    <section className="section-snap bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-brand-blue">More than just skill exchange</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">
            Everything You Need to Connect &amp; Learn
          </h2>
        </motion.div>

        <div className="mt-12">
          <CardCarousel
            items={features}
            keyField={(f) => f.title}
            renderCard={(f) => {
              const Icon = f.icon;
              const isBlue = f.tone === "blue";
              return (
                <div className="group card h-full p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-blue hover:shadow-lg">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 ${
                      isBlue ? "icon-badge-blue" : "icon-badge-green"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-carbon">{f.title}</h3>
                  <p className="mt-1 text-xs text-charcoal">{f.desc}</p>
                </div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
