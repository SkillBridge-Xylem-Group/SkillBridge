type WelcomeBannerProps = {
  name: string;
};

export default function WelcomeBanner({ name }: WelcomeBannerProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-100 bg-white p-8 sm:flex-row sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Welcome to SkillBridge, {name}! 👋
        </h1>
        <p className="mt-3 max-w-lg text-slate-500">
          You&apos;re all set! Start exploring the community, request skill swaps, and help others grow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard/browse-people"
            className="btn-pill bg-brand px-6 py-3 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
          >
            Browse People
          </a>
          <a
            href="/dashboard/forum"
            className="btn-pill border-2 border-brand px-6 py-3 text-sm text-brand hover:bg-brand-light"
          >
            Explore Forum
          </a>
        </div>
      </div>

      <img
        src="/images/dashboard-welcome.png"
        alt="Illustration of a person waving hello from their desk"
        className="h-40 w-40 shrink-0 object-contain sm:h-48 sm:w-48"
      />
    </div>
  );
}