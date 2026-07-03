"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

const mentors = [
  {
    name: "Julian Voss",
    role: "Principal Motion Architect @ CreativeFlow",
    tags: ["Motion Design", "After Effects", "Interaction Logic"],
    desc: "Specializing in bridging the gap between static interfaces and dynamic storytelling. I can help you master Lottie, Rive, and more.",
    experience: "12+ Years",
  },
  {
    name: "Amara Okafor",
    role: "Senior Web3 Engineer @ EtherLink",
    tags: ["Web3", "React", "Solidity", "Next.js"],
    desc: "I help developers transition from Web2 to Web3. Expert in dApp architecture, smart contract security, and high-performance front-ends.",
    experience: "8 Years",
  },
  {
    name: "Leo Chen",
    role: "Full Stack Designer @ NeonPixel",
    tags: ["React", "Motion Design", "Tailwind CSS"],
    desc: "Focused on micro-interactions and atomic design systems. I'll show you how to build scalable React components that feel alive.",
    experience: "6 Years",
  },
];

const industries = [
  "Tech & SaaS",
  "Web3 & Blockchain",
  "FinTech",
  "Creative Agencies",
  "Healthcare",
  "E-commerce",
  "Education",
];

export default function RecommendedMentorsPage() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["Tech & SaaS", "Web3 & Blockchain"]);
  const [availability, setAvailability] = useState("Available this week");
  const [minRating, setMinRating] = useState(4.0);

  function toggleIndustry(i: string) {
    setSelectedIndustries((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function handleReset() {
    setSelectedIndustries([]);
    setAvailability("Available this week");
    setMinRating(0);
  }

  return (
    <DashboardShell>
      <div className="pt-2">
        <Link
          href="/dashboard/profile?tab=skills-learning"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Skills Learning
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Curated For You</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {mentors.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{m.name}</p>
                      <p className="text-sm font-semibold text-brand">{m.role}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.tags.map((t) => (
                          <span key={t} className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Experience</p>
                    <p className="font-bold text-slate-900">{m.experience}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{m.desc}</p>
                <div className="mt-5 flex gap-3">
                  <button className="btn-pill bg-brand px-6 py-2.5 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark">
                    Book Session
                  </button>
                  <button className="btn-pill border-2 border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Discovery Filters</h2>
              <button type="button" onClick={handleReset} className="text-sm font-bold text-brand hover:underline">
                Reset
              </button>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Industry</p>
              <div className="mt-3 space-y-3">
                {industries.map((i) => (
                  <label key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(i)}
                      onChange={() => toggleIndustry(i)}
                      className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
                    />
                    {i}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Availability</p>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option>Available this week</option>
                <option>Available today</option>
                <option>Available this month</option>
                <option>Any time</option>
              </select>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Minimum Rating</p>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand"
                />
                <span className="text-sm font-bold text-brand">{minRating.toFixed(1)}+</span>
              </div>
            </div>

            <button className="btn-pill mt-8 w-full bg-brand py-3 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}