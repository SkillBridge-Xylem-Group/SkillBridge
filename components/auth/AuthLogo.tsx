import Image from "next/image";
import Link from "next/link";

type AuthLogoProps = {
  variant?: "dark" | "light";
  size?: number;
};

export default function AuthLogo({ variant = "dark", size = 56 }: AuthLogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image
        src="/images/logo-mark.png"
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      <span
        className="text-xl font-extrabold"
        style={{
          fontFamily: "var(--font-friendly)",
          color: variant === "light" ? "#ffffff" : "var(--neu-major)",
        }}
      >
        SkillBridge
      </span>
    </Link>
  );
}