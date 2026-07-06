import Link from "next/link";
import { ArrowRight } from "lucide-react";

const skills = [
  {
    image: "/images/categories/fullstack.jpg",
    mentors: "240 Active Mentors",
    title: "Full-Stack Dev",
    desc: "React, Node.js, and System Architecture",
    tags: ["Technology", "Trending"],
  },
  {
    image: "/images/categories/uiux.jpg",
    mentors: "185 Active Mentors",
    title: "UI/UX Design",
    desc: "Visual Identity, Prototyping, and Research",
    tags: ["Design", "Creative"],
  },
  {
    image: "/images/categories/product.jpg",
    mentors: "92 Active Mentors",
    title: "Product Strategy",
    desc: "Agile, GTM Strategy, and Roadmap Planning",
    tags: ["Business"],
  },
  {
    image: "/images/categories/marketing.jpg",
    mentors: "115 Active Mentors",
    title: "Digital Marketing",
    desc: "SEO, Content Strategy, and Performance Ad",
    tags: ["Marketing", "Growth"],
  },
];

export default function FeaturedSkills() {
  return (
    <section id="skills" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Featured Skills</h2>
            <p className="mt-2 text-slate-500">Trending domains this week in the community.</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1.5 font-bold text-brand hover:underline">
            View all categories
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s) => (
            <div
              key={s.title}
              className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900">
                  {s.mentors}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}