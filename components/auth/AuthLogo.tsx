import Image from "next/image";
import Link from "next/link";

export default function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image
        src="/images/logo-mark.png"
        alt=""
        width={56}
        height={56}
        priority
        className="h-14 w-14 shrink-0"
      />
      <span className="text-xl font-extrabold text-brand">SkillBridge</span>
    </Link>
  );
}
