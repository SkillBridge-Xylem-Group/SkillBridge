import { Globe, Sparkles } from "lucide-react";

export default function ImpactSection() {
  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:px-10 lg:grid-cols-3">
        <div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Real Progress. Real Impact.</h2>
          <p className="mt-4 text-slate-300">
            SkillBridge isn&apos;t just a platform; it&apos;s a movement towards decentralized education. We
            believe the best way to learn is to explain, and the best way to grow is together.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Globe size={18} />
              </div>
              <div>
                <p className="font-bold">Global Accessibility</p>
                <p className="mt-1 text-sm text-slate-400">
                  Empowering learners in over 45 countries with high-speed skill acquisition regardless of
                  financial background.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold">Mutual Prosperity</p>
                <p className="mt-1 text-sm text-slate-400">
                  Our barter-style system ensures that everyone contributes value, creating a sustainable
                  ecosystem of knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/images/impact-team.jpg"
              alt="Team collaborating on a whiteboard"
              className="h-64 w-full object-cover"
            />
          </div>
          <div className="mt-4 rounded-2xl bg-slate-800 p-6">
            <p className="text-3xl font-extrabold">1.2M+</p>
            <p className="mt-1 text-sm text-slate-300">Hours of mentorship exchanged since launch in 2023.</p>
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-brand p-8">
            <p className="text-4xl font-extrabold text-white/40">&rdquo;</p>
            <p className="mt-2 italic text-white">
              &ldquo;I taught three people Basic Italian and in return, I learned enough Python to automate my
              entire workflow. Life-changing.&rdquo;
            </p>
            <p className="mt-4 font-bold text-white">— Marco R., Product Manager</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <img
              src="/images/impact-celebration.jpg"
              alt="Team celebrating together"
              className="h-64 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}