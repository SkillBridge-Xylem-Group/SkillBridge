"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import OnboardingModal from "./OnboardingModal";

type OnboardingGateProps = {
  /** Computed on the server (e.g. from the user's profile) before render. */
  initialShow: boolean;
  /** Category -> skill names, fetched server-side from the `skills` table. */
  skillsByCategory: Record<string, string[]>;
};

export default function OnboardingGate({ initialShow, skillsByCategory }: OnboardingGateProps) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [show, setShow] = useState(initialShow);
  const [showSavedToast, setShowSavedToast] = useState(false);

  function handleComplete() {
    setShow(false);
    setShowSavedToast(true);
    // Other server-rendered views (dashboard, profile) read the same
    // profiles row, so refresh their data now instead of leaving them
    // showing what was there before onboarding was submitted.
    router.refresh();
    setTimeout(() => setShowSavedToast(false), 3000);
  }

  return (
    <>
      {show && (
        <OnboardingModal onComplete={handleComplete} skillsByCategory={skillsByCategory} />
      )}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {dictionary.onboarding.skillSaved}
        </div>
      )}
    </>
  );
}
