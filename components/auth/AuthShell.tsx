import { type ReactNode } from "react";
import AuthLogo from "./AuthLogo";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden flex-col bg-brand-light px-10 py-10 lg:flex">
        <AuthLogo />
        <div className="mt-10 flex flex-1 items-center justify-center overflow-hidden rounded-[2rem]">
          <img
            src="/images/auth-illustration.png"
            alt="People learning and teaching together"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <AuthLogo />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}