import { type ReactNode } from "react";
import AuthLogo from "./AuthLogo";

type AuthShellProps = {
  children: ReactNode;
};
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="auth-neu-page flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="auth-neu-card-mobile w-full max-w-md rounded-[32px] p-8 text-center sm:p-10">
        <div className="mb-6 flex justify-center">
          <AuthLogo />
        </div>
        {children}
      </div>
    </main>
  );
}