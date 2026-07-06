import { ShieldCheck, RefreshCcw, MessageSquare, Award } from "lucide-react";

const features = [
  { icon: RefreshCcw, title: "Free Skill Exchange", desc: "Learn without paying expensive course fees." },
  { icon: ShieldCheck, title: "Verified Profiles", desc: "Build confidence through Trust Scores and user reviews." },
  { icon: MessageSquare, title: "Community Support", desc: "Ask questions and receive answers from experienced members." },
  { icon: Award, title: "Earn Experience", desc: "Gain XP and level up every time you complete a teaching session." },
];

export default function Growth() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 sm:px-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Your Growth Matters
          </h2>
          <p className="mt-3 text-sm font-bold text-brand">Why Choose SkillBridge?</p>

          <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title}>
                  <div className="flex items-center gap-2 text-sm font-bold text-brand">
                    <Icon size={16} />
                    {f.title}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === 0 ? "bg-brand" : "bg-slate-300"}`} />
            ))}
          </div>
          <div className="overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-slate-100">
            <img
              src="/images/signup.png"
              alt="Person working on laptop signing up"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}