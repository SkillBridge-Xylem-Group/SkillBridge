import type { Metadata } from "next";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata: Metadata = {
  title: "Sign In | SkillBridge",
};

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string; error?: string; loggedOut?: string; mode?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <SlidingAuthCard
      initialMode={params.mode}
      redirectTo={params.redirectTo}
      urlError={params.error}
      justLoggedOut={params.loggedOut === "1"}
    />
  );
}
