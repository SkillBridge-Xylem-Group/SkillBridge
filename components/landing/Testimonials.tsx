"use client";

import { motion } from "framer-motion";
import { CardCarousel } from "@/components/ui/card-carousel";

// Placeholder example quotes for layout purposes — swap for real quotes once
// real members have completed swaps and consented to be featured.
const quotes = [
  { text: "I taught Python to someone in Brazil and learned UI Design in return. Amazing experience!", name: "Aisha K.", offers: "Python" },
  { text: "This platform is exactly what I needed. Learning new skills without paying anything.", name: "Daniel R.", offers: "Guitar" },
  { text: "The community is so supportive. I've already learned so much!", name: "Maya L.", offers: "Marketing" },
  { text: "Found a language partner within a day. We've been swapping Spanish for React for months now.", name: "Sarah T.", offers: "React" },
  { text: "Best free resource I've found for leveling up a skill without spending a cent.", name: "Ahmed F.", offers: "Data Analysis" },
];

function initials(name: string) {
  return name.charAt(0).toUpperCase();
}

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
          <p className="eyebrow text-brand-blue">Voices from our community</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-carbon">Why People Join SkillBridge</h2>
        </motion.div>

        <div className="mt-12">
          <CardCarousel
            items={quotes}
            keyField={(q) => q.name}
            renderCard={(q, i) => (
              <div className="group card h-full p-6 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-blue hover:shadow-lg">
                <p className="text-3xl font-medium text-blue-border">&ldquo;</p>
                <p className="mt-1 text-sm text-carbon">{q.text}</p>
                <div className="mt-5 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-transform duration-300 ease-out group-hover:scale-110 ${
                      i % 2 === 0 ? "icon-badge-blue" : "icon-badge-green"
                    }`}
                  >
                    {initials(q.name)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-carbon">{q.name}</p>
                    <p className="text-xs text-brand-green">Offers {q.offers}</p>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
