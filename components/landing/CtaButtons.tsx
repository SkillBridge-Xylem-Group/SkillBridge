type CtaButtonsProps = {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export default function CtaButtons({
  primaryLabel = "Get Started",
  primaryHref = "#get-started",
  secondaryLabel = "Explore Skills",
  secondaryHref = "#skills",
}: CtaButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <a
        href={primaryHref}
        className="btn-pill bg-brand px-12 py-5 text-base text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
      >
        {primaryLabel}
      </a>
      <a
        href={secondaryHref}
        className="btn-pill border-2 border-brand bg-white px-12 py-5 text-base text-brand hover:bg-brand-light"
      >
        {secondaryLabel}
      </a>
    </div>
  );
}