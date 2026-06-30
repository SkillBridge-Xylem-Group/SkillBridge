import { UserPlus, Search, MessageCircle, Trophy } from "lucide-react";

const steps = [
  { icon: UserPlus, step: "STEP 1", title: "Create Your Profile", desc: "Tell everyone what you can teach and what you'd like to learn." },
  { icon: Search, step: "STEP 2", title: "Find Learning Partners", desc: "Browse skills, filter by category, ratings, and interests." },
  { icon: MessageCircle, step: "STEP 3", title: "Chat & Schedule", desc: "Coordinate your learning sessions through private messaging." },
  { icon: Trophy, step: "STEP 4", title: "Teach, Learn & Earn XP", desc: "Complete sessions, receive reviews, gain experience points, and increase your Trust Score." },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F2F2F7] py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
          How SkillBridge Works
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="text-center">
                <p className="text-xs font-bold tracking-widest text-brand">{s.step}</p>
                <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
                  <Icon size={26} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}