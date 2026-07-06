import { ArrowUpRight } from "lucide-react";

type BrowseForumLinkProps = {
  href?: string;
  label?: string;
};

export default function BrowseForumLink({
  href = "#skills",
  label = "Browse the community forum",
}: BrowseForumLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
    >
      {label}
      <ArrowUpRight size={16} />
    </a>
  );
}