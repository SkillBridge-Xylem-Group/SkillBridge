import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | SkillBridge",
};

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string; error?: string; loggedOut?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell>
      <LoginForm
        redirectTo={params.redirectTo}
        urlError={params.error}
        justLoggedOut={params.loggedOut === "1"}
      />
    </AuthShell>
  );
}
