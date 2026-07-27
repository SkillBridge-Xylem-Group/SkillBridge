import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Explore", href: "/#showcase" },
  { label: "Community", href: "/#join" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[rgba(240,253,244,0.7)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[22px] font-bold"
          style={{ fontFamily: "var(--font-playful)", color: "var(--neu-ink)" }}
        >
          <Image src="/images/logo-mark-v2.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
          SkillBridge
        </Link>

        <div className="hidden gap-9 text-[15px] font-semibold sm:flex" style={{ color: "var(--neu-ink)" }}>
          {links.map((link) => (
            <a key={link.label} href={link.href} className="hover:opacity-70">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <Link href="/login" className="hidden text-[15px] font-semibold sm:inline" style={{ color: "var(--neu-ink)" }}>
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-2xl px-5 py-2.5 text-sm font-bold"
            style={{
              fontFamily: "var(--font-playful)",
              background: "var(--neu-yellow)",
              color: "var(--neu-ink)",
              border: "2.5px solid var(--neu-ink)",
              boxShadow: "4px 4px 0 var(--neu-ink)",
            }}
          >
            Join Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
