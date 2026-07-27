import Image from "next/image";
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
          <Image src="/images/logo-mark-v2.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
          SkillBridge
        </Link>
        <span className="text-sm font-semibold" style={{ color: "var(--neu-text-muted)" }}>
          © 2026 SkillBridge. Learn together, free forever.
        </span>
      </div>
    </footer>
  );
}
