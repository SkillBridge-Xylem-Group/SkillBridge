import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-3 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-11 w-11 shrink-0"
          />
          <span className="text-xl font-extrabold text-brand">SkillBridge</span>
        </Link>
      </div>
    </header>
  );
}