export default function FinalCta() {
  return (
    <section id="get-started" className="bg-[#F5F6FE] px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-brand px-6 py-16 text-center text-white sm:px-16">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to bridge your skill gap?</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/90">
          Join the thousands of experts and learners who are redefining how the world shares knowledge. Your
          first session is on us.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/register" className="btn-pill bg-white px-8 py-4 text-base text-brand hover:bg-slate-100">
            Create Free Account
          </a>
        </div>
      </div>
    </section>
  );
}