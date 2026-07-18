type WelcomeBannerProps = {
  name: string;
};

export default function WelcomeBanner({ name }: WelcomeBannerProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-3xl p-8"
      style={{ background: "linear-gradient(135deg, #fff, #f6f2ff)", border: "2.5px solid var(--neu-ink)", boxShadow: "6px 6px 0 var(--neu-ink)" }}
    >
      <h1 className="text-2xl font-extrabold nb-heading sm:text-3xl">
        Welcome to SkillBridge, {name}! 👋
      </h1>
      <p className="max-w-lg" style={{ color: "var(--neu-text-muted)" }}>
        You&apos;re all set! Start exploring the community, request skill swaps, and help others grow.
      </p>
    </div>
  );
}
