export default function About() {
  return (
    <section className="bg-[#EFEFF4] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
          <img
            src="/images/phones.png"
            alt="Hands holding phones chatting"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-brand">
            SHARE SKILLS, <span className="text-slate-500">NOT MONEY</span>
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Learning should be accessible to everyone.
          </h2>
          <p className="mt-5 max-w-xl text-slate-600">
            SkillBridge connects learners and mentors through free
            peer-to-peer skill exchange. Whether you&apos;re learning
            programming, photography, languages, or design, you can grow
            together with a global community.
          </p>
        </div>
      </div>
    </section>
  );
}