import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-fog bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-11 w-11 shrink-0"
          />
          <span className="text-xl font-medium text-carbon">SkillBridge</span>
        </Link>

        <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
          Join now
        </Link>
      </div>
    </header>
  );
}
