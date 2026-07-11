import Image from "next/image";
import { ArrowUp } from "lucide-react";

const links = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Community", href: "#community" },
  { label: "Get Started", href: "#get-started" },
];

export default function Footer() {
  return (
    <footer className="border-t border-fog bg-white pt-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <Image src="/images/logo-mark.png" alt="" width={34} height={34} className="h-8 w-8" />
              <span className="text-xl font-medium text-carbon">SkillBridge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-charcoal">
              Bridging the gap between people who want to learn and those who want to teach.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-charcoal transition-colors hover:text-brand-blue"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fog py-6 text-sm text-charcoal">
          <p>© 2026 SkillBridge. All rights reserved.</p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 font-medium text-charcoal transition-colors hover:text-brand-blue"
          >
            Back to top
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
