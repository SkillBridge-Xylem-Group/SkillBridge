import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const categories = [
  { image: "fullstack.jpg", title: "Full-Stack Dev", desc: "React, Node.js, and System Architecture", mentors: "240", tags: ["Technology", "Trending"] },
  { image: "uiux.jpg", title: "UI/UX Design", desc: "Visual Identity, Prototyping, and Research", mentors: "185", tags: ["Design", "Creative"] },
  { image: "product.jpg", title: "Product Strategy", desc: "Agile, GTM Strategy, and Roadmap Planning", mentors: "92", tags: ["Business"] },
  { image: "marketing.jpg", title: "Digital Marketing", desc: "SEO, Content Strategy, and Performance Ad", mentors: "115", tags: ["Marketing", "Growth"] },
  { image: "datascience.jpg", title: "Data Science", desc: "Python, Machine Learning, and Data Visualization", mentors: "78", tags: ["Technology", "Analytics"] },
  { image: "mobile.jpg", title: "Mobile Development", desc: "iOS, Android, and React Native", mentors: "64", tags: ["Technology"] },
  { image: "copywriting.jpg", title: "Copywriting", desc: "Persuasive writing, brand voice, and storytelling", mentors: "41", tags: ["Creative", "Marketing"] },
  { image: "speaking.jpg", title: "Public Speaking", desc: "Presentation skills and confident delivery", mentors: "35", tags: ["Soft Skills"] },
  { image: "photography.jpg", title: "Photography", desc: "Composition, lighting, and photo editing", mentors: "58", tags: ["Creative"] },
  { image: "finance.jpg", title: "Finance & Investing", desc: "Personal finance, stocks, and portfolio strategy", mentors: "47", tags: ["Business", "Finance"] },
  { image: "music.jpg", title: "Music Production", desc: "Mixing, mastering, and DAW workflows", mentors: "29", tags: ["Creative"] },
  { image: "language.jpg", title: "Language Learning", desc: "Conversational fluency in 10+ languages", mentors: "112", tags: ["Education"] },
  { image: "devops.jpg", title: "DevOps & Cloud", desc: "AWS, CI/CD pipelines, and infrastructure as code", mentors: "53", tags: ["Technology"] },
  { image: "video.jpg", title: "Video Editing", desc: "Storytelling, pacing, and post-production", mentors: "38", tags: ["Creative"] },
  { image: "career.jpg", title: "Career Coaching", desc: "Resume building, interviews, and career pivots", mentors: "66", tags: ["Soft Skills"] },
  { image: "security.jpg", title: "Cybersecurity", desc: "Threat modeling, penetration testing, and compliance", mentors: "31", tags: ["Technology"] },
];

export default function CategoriesPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c.title}
                className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40">
                  <img
                    src={`/images/categories/${c.image}`}
                    alt={c.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900">
                    {c.mentors} mentors
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-extrabold text-slate-900">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{c.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.tags.map((t) => (
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

      <Footer />
    </main>
  );
}