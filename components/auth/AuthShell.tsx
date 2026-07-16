import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthLogo from "./AuthLogo";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden lg:grid-cols-[45fr_55fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/auth-illustration.png"
          alt="Two people exchanging skills — one working on a laptop, the other reading a book"
          fill
          priority
          quality={90}
          sizes="45vw"
          className="object-cover"
          style={{ objectPosition: "25% center" }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/95 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center px-8 py-6">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
            style={{ color: "var(--color-brand-blue)" }}
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-8 py-6">
          <h2
            className="text-6xl"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontWeight: 700,
              backgroundImage: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Exchange Skill
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center overflow-y-auto bg-white px-6 py-6 sm:pl-8 sm:pr-10">
        <div className="w-full max-w-lg py-6">
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: "var(--color-blue-wash)", color: "var(--color-brand-blue)" }}
            >
              <ArrowLeft size={16} />
            </Link>
            <AuthLogo />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
