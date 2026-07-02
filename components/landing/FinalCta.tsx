import CtaButtons from "./CtaButtons";

export default function FinalCta() {
  return (
    <section id="get-started" className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Ready to Start Learning?
        </h2>
        <p className="mt-4 text-slate-600">
          Join a global community where knowledge is shared freely and
          everyone has something valuable to teach.
        </p>
        <div className="mt-8">
          <CtaButtons
            primaryLabel="Register Now"
            primaryHref="/register"
            secondaryLabel="Explore Skills"
            secondaryHref="#skills"
          />
        </div>
      </div>
    </section>
  );
}