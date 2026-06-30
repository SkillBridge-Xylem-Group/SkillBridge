import { FlaskConical, Users, FileStack, Star } from "lucide-react";

const stats = [
  { icon: FlaskConical, value: "120+", label: "Skills Shared" },
  { icon: Users, value: "500+", label: "Active Members" },
  { icon: FileStack, value: "1,200+", label: "Skill Sessions" },
  { icon: Star, value: "4.9", label: "Average Trust Score" },
];

export default function Stats() {
  return (
    <section className="bg-gradient-to-r from-brand to-[#5A47E0] py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 text-center sm:px-10 md:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                <Icon size={24} />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-white/80">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}