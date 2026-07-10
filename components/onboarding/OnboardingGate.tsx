"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingModal from "./OnboardingModal";

type OnboardingGateProps = {
  /** Computed on the server (e.g. from the user's profile) before render. */
  initialShow: boolean;
};

export default function OnboardingGate({ initialShow }: OnboardingGateProps) {
  const router = useRouter();
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
      {show && <OnboardingModal onComplete={handleComplete} />}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          Skill saved
        </div>
      )}
    </>
  );
}
