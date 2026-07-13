"use client";

import { motion } from "framer-motion";
import { Search, Share2, Sparkles, Globe2, ShieldCheck } from "lucide-react";
import Navbar from "./Navbar";
import { WorldMap } from "@/components/ui/world-map";
const floatingCards = [
  { name: "Emma", offers: "Graphic Design", wants: "Korean", top: "2%", left: "48%" },
  { name: "Rafael", offers: "Portuguese", wants: "Photography", top: "0%", left: "88%" },
  { name: "Aisha", offers: "Python", wants: "UI/UX Design", top: "62%", left: "22%" },
  { name: "Daniel", offers: "Guitar", wants: "Music Theory", top: "72%", left: "70%" },
];

const routes = [
  { start: { lat: 40.7128, lng: -74.006 }, end: { lat: 38.7223, lng: -9.1393 } }, // New York → Lisbon
  { start: { lat: 38.7223, lng: -9.1393 }, end: { lat: -23.5505, lng: -46.6333 } }, // Lisbon → São Paulo
  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } }, // London → New Delhi
  { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 37.5665, lng: 126.978 } }, // New Delhi → Seoul
  { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } }, // New Delhi → Nairobi
];

const trustPoints = [
  { icon: Sparkles, title: "New Platform", desc: "We're just getting started" },
  { icon: Globe2, title: "Global Community", desc: "Open to everyone" },
  { icon: ShieldCheck, title: "Built for Trust", desc: "By the community" },
];

function initials(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function Hero() {
  return (
    <section className="section-snap overflow-hidden bg-white">
      <Navbar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[0.85fr_1.25fr] lg:gap-8 lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-fog bg-white px-4 py-2 text-sm font-medium text-carbon">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            Free. Global. Community-driven.
          </span>

          <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            <span className="text-brand-blue">Learn</span>{" "}
            <span className="text-carbon">from people.</span>
            <br />
            <span className="text-brand-green">Teach</span>{" "}
            <span className="text-carbon">what you know.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-charcoal">
            SkillBridge connects people around the world to exchange skills for free. No money. Just
            knowledge.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <motion.a
              href="#community"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary gap-2 text-base"
            >
              <Search size={18} />
              Find a skill partner
            </motion.a>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary gap-2 text-base"
            >
              <Share2 size={18} />
              Share your skills
            </motion.a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-fog pt-6 sm:grid-cols-3">
            {trustPoints.map((p, i) => {
              const Icon = p.icon;
              const tone = i % 2 === 0 ? "text-brand-blue" : "text-brand-green";
              return (
                <div key={p.title} className="flex items-start gap-2">
                  <Icon size={18} className={`mt-0.5 shrink-0 ${tone}`} />
                  <div>
                    <p className="text-sm font-medium text-carbon">{p.title}</p>
                    <p className="text-xs text-charcoal">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto mt-4 w-full max-w-none overflow-hidden rounded-2xl lg:mt-0 lg:overflow-visible">
          <WorldMap dots={routes} lineColor="#2563eb" />

          {floatingCards.map((card, i) => (
            <motion.div
              key={card.name}
              style={{ top: card.top, left: card.left }}
              initial={{ x: "-50%", y: 0, opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              animate={{ x: "-50%", y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 + i * 0.15 },
                y: { duration: 3.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
              }}
              className="card-floating absolute w-32 p-2 text-xs sm:w-40 sm:p-3 sm:text-sm md:w-44"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs ${
                    i % 2 === 0 ? "icon-badge-blue" : "icon-badge-green"
                  }`}
                >
                  {initials(card.name)}
                </div>
                <p className="truncate text-xs font-medium text-carbon sm:text-sm">{card.name}</p>
              </div>
              <p className="mt-1.5 truncate text-[10px] text-brand-green sm:mt-2 sm:text-xs">
                Offers <span className="font-medium text-carbon">{card.offers}</span>
              </p>
              <p className="truncate text-[10px] text-brand-blue sm:text-xs">
                Wants <span className="font-medium text-carbon">{card.wants}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

