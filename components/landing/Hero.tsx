import Navbar from "./Navbar";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand to-[#5A47E0]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-10">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="relative">
            <img
              src="/images/hero.png"
              alt="People learning and teaching together"
              className="h-[260px] w-full object-cover sm:h-[320px]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent px-8 pb-8 pt-16 sm:px-12">
              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                Learn. Teach. Grow Together
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Exchange skills with people around the world for free. Find
                learning partners, share your expertise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}