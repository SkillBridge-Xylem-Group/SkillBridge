"use client";

import { useState } from "react";

/** Honeypot + mount timestamp for bot protection on auth forms. */
export function useFormGuard() {
  const [website, setWebsite] = useState("");
  const [formStartedAt] = useState(() => Date.now());

  return {
    website,
    setWebsite,
    guardPayload: { website, formStartedAt },
  };
}
