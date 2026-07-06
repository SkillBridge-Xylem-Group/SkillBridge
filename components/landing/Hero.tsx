import { BadgeCheck } from "lucide-react";
import Navbar from "./Navbar";

export default function Hero() {
  return (
    <section className="bg-white">
      <Navbar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-6 sm:px-10 lg:grid-cols-2 lg:py-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
            <BadgeCheck size={16} />
            The World&apos;s #1 Skill-Exchange Platform
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Master any skill by <span className="text-brand">teaching</span> what you know.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Bridge the gap between learning and doing. Join a global community where expertise is traded, not
            bought. Teach your passion, gain new mastery.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            
              <a href="#get-started"
              className="btn-pill bg-brand px-8 py-4 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
            >
              Start Learning Now
            </a>
            
              <a href="#skills"
              className="btn-pill border-2 border-brand bg-white px-8 py-4 text-base text-brand hover:bg-brand-light"
            >
              Browse Community
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="/images/hero-session.jpg"
              alt="Two colleagues collaborating over a laptop"
              className="h-[420px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}