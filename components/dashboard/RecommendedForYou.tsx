import { Star } from "lucide-react";

type Person = {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews: number;
  tags: string[];
  offersHelpIn: string;
};

const people: Person[] = [
  {
    name: "Sarah Kim",
    role: "UI/UX Designer",
    avatar: "/images/avatars/sarah-kim.jpg",
    rating: 4.8,
    reviews: 32,
    tags: ["Figma", "UI Design", "Wireframing"],
    offersHelpIn: "Figma, UI Design",
  },
  {
    name: "Alex Chen",
    role: "Web Developer",
    avatar: "/images/avatars/alex-chen.jpg",
    rating: 4.7,
    reviews: 28,
    tags: ["JavaScript", "React", "Node.js"],
    offersHelpIn: "JavaScript, React",
  },
  {
    name: "Maria Lopez",
    role: "Language Tutor",
    avatar: "/images/avatars/maria-lopez.jpg",
    rating: 4.9,
    reviews: 41,
    tags: ["Spanish", "English", "Grammar"],
    offersHelpIn: "Spanish, English",
  },
];

export default function RecommendedForYou() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Recommended for you</h2>
        <a href="/dashboard/browse-people" className="text-sm font-bold text-brand hover:underline">
          View all
        </a>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {people.map((p) => (
          <div key={p.name} className="rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="h-11 w-11 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.role}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {p.rating} ({p.reviews})
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-semibold text-brand">
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs font-semibold text-brand">Offers help in {p.offersHelpIn}</p>

            <a
              href="#"
              className="btn-pill mt-4 block border-2 border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-brand/40 hover:text-brand"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}