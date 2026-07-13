"use client";

import { useEffect, useState } from "react";

/** Honeypot + mount timestamp for bot protection on auth forms. */
export function useFormGuard() {
  const [website, setWebsite] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(0);

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, []);

  return {
    website,
    setWebsite,
    guardPayload: { website, formStartedAt },
  };
}
