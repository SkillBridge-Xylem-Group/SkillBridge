import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f7fef9 45%, #ecfdf5 100%)" }}>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[22px] font-bold"
          style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[17px] font-extrabold text-white"
            style={{
              background: "var(--neu-indigo)",
              border: "2.5px solid var(--neu-ink)",
              boxShadow: "3px 3px 0 var(--neu-ink)",
            }}
          >
            S
          </span>
          SkillBridge
        </Link>
        <span className="text-sm font-semibold" style={{ color: "var(--neu-text-muted)" }}>
          © 2026 SkillBridge. Learn together, free forever.
        </span>
      </div>
    </footer>
  );
}
