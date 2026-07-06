"use client";

import { useState } from "react";
import {
  Code2,
  Languages,
  Palette,
  Music2,
  UtensilsCrossed,
  Briefcase,
  Users,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const categories = ["All", "Design", "Food", "Tech", "Music", "Medicine"];

type Subject = {
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
  metaIcon: LucideIcon;
  group: string;
};

const subjects: Subject[] = [
  { icon: Code2, title: "Programming", desc: "Learn Java, Python, Web Development", meta: "215 Learners", metaIcon: Users, group: "Tech" },
  { icon: Languages, title: "Languages", desc: "English, Japanese, Korean", meta: "184 Mentors", metaIcon: GraduationCap, group: "Design" },
  { icon: Palette, title: "Graphic Design", desc: "Figma, Photoshop, Canva", meta: "142 Mentors", metaIcon: GraduationCap, group: "Design" },
  { icon: Music2, title: "Music", desc: "Piano, Guitar, Singing", meta: "98 Learners", metaIcon: Users, group: "Music" },
  { icon: UtensilsCrossed, title: "Cooking", desc: "Baking, Traditional Cuisine, Healthy Meals", meta: "156 Learners", metaIcon: Users, group: "Food" },
  { icon: Briefcase, title: "Business", desc: "Marketing, Public Speaking, Entrepreneurship", meta: "112 Mentors", metaIcon: GraduationCap, group: "Tech" },
];

export default function Subjects() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? subjects : subjects.filter((s) => s.group === active);

  return (
    <section id="skills" className="bg-[#F7F7FB] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-brand">COURSES</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Popular Subjects
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`btn-pill border px-5 py-2 text-sm ${
                  isActive
                    ? "border-brand bg-brand text-white shadow-md shadow-brand/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => {
            const Icon = s.icon;
            const MetaIcon = s.metaIcon;
            return (
              <div
                key={s.title}
                className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <MetaIcon size={16} />
                  {s.meta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}