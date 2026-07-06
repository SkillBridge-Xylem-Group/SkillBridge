import Link from "next/link";

export default function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center">
      <span className="text-xl font-extrabold text-brand">SkillBridge</span>
    </Link>
  );
}