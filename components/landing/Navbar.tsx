import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-3 sm:px-10">
        <Link href="/" className="text-xl font-extrabold text-brand">
          SkillBridge
        </Link>
      </div>
    </header>
  );
}