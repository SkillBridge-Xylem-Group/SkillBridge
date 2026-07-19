"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { interpolate } from "@/lib/i18n/interpolate";

type WelcomeBannerProps = {
  name: string;
};

export default function WelcomeBanner({ name }: WelcomeBannerProps) {
  const { dictionary } = useLocale();
  const h = dictionary.home;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 text-white sm:p-10"
      style={{ background: "var(--sb-gradient)", boxShadow: "var(--sb-shadow-lg)" }}
    >
      <div
        className="pointer-events-none absolute rounded-full"
        style={{ width: 220, height: 220, top: -90, right: 60, background: "rgba(255,255,255,.14)" }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{ width: 150, height: 150, bottom: -70, right: -30, background: "rgba(255,255,255,.14)" }}
      />
      <div className="relative z-10">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {interpolate(h.welcomeBack, { name })} 👋
        </h1>
        <p className="mt-2.5 max-w-md text-[15px] opacity-95">
          {h.welcomeSubtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/browse-people"
            className="rounded-full bg-white px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5"
            style={{ color: "var(--sb-emerald-dark)" }}
          >
            {h.findPartner}
          </Link>
          <Link
            href="/dashboard/swap-requests"
            className="rounded-full border border-white/50 bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25"
          >
            {h.viewSwapRequests}
          </Link>
        </div>
      </div>
    </div>
  );
}
