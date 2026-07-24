"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

type TopbarLeadingContextValue = {
  leading: ReactNode;
  setLeading: (node: ReactNode) => void;
};

const TopbarLeadingContext = createContext<TopbarLeadingContextValue | null>(null);

export function TopbarLeadingProvider({ children }: { children: ReactNode }) {
  const [leading, setLeading] = useState<ReactNode>(null);

  return (
    <TopbarLeadingContext.Provider value={{ leading, setLeading }}>
      {children}
    </TopbarLeadingContext.Provider>
  );
}

export function useTopbarLeading() {
  return useContext(TopbarLeadingContext)?.leading ?? null;
}

export function SetTopbarLeading({ children }: { children: ReactNode }) {
  const ctx = useContext(TopbarLeadingContext);

  useLayoutEffect(() => {
    if (!ctx) return;
    ctx.setLeading(children);
    return () => ctx.setLeading(null);
  });

  return null;
}
