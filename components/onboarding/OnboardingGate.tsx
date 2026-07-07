"use client";

import { useState } from "react";
import OnboardingModal from "./OnboardingModal";

type OnboardingGateProps = {
  /** Computed on the server (e.g. from the user's profile) before render. */
  initialShow: boolean;
};

export default function OnboardingGate({ initialShow }: OnboardingGateProps) {
  const [show, setShow] = useState(initialShow);

  if (!show) return null;

  return <OnboardingModal onComplete={() => setShow(false)} />;
}