import Link from "next/link";
import { Pencil } from "lucide-react";

type ProfileTabsProps = {
  active: "about" | "skills-teaching" | "skills-learning" | "reviews";
};

const tabs = [
  { key: "about", label: "About", href: "/dashboard/profile" },
  { key: "skills-teaching", label: "Skills Teaching", href: "/dashboard/profile?tab=skills-teaching" },
  { key: "skills-learning", label: "Skills Learning", href: "/dashboard/profile?tab=skills-learning" },
  { key: "reviews", label: "Reviews", href: "/dashboard/profile?tab=reviews" },
] as const;

export default function ProfileTabs({ active }: ProfileTabsProps) {
  return (
    <div className="pt-2">
      <div className="relative h-64 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 to-slate-500">
        <Link
          href="/dashboard/profile/edit"
          aria-label="Edit profile"
          className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-50"
        >
          <Pencil size={18} />
        </Link>

        <div className="absolute bottom-4 left-8 h-56 w-56 rounded-full border-4 border-white bg-slate-200 shadow-lg" />
      </div>

      <div className="mt-6 flex gap-8 border-b border-slate-100">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`pb-3 text-sm font-bold ${
              active === tab.key
                ? "border-b-2 border-brand text-brand"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}