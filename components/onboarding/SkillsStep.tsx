import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export const OTHER_SUBJECT = "Other";

export type SkillsStepProps = {
  title: string;
  description: string;
  subjectOptions: string[];
  subject: string;
  onSubjectChange: (value: string) => void;
  customSubject: string;
  onCustomSubjectChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  /** "green" for the teach/offer step, "blue" for the learn/want step —
      matches the offers=green / wants=blue convention used elsewhere
      (profile cards, hero floating cards). */
  accent?: "blue" | "green";
};

export default function SkillsStep({
  title,
  description,
  subjectOptions,
  subject,
  onSubjectChange,
  customSubject,
  onCustomSubjectChange,
  tags,
  selectedTags,
  onToggleTag,
  accent = "blue",
}: SkillsStepProps) {
  const { dictionary } = useLocale();
  const o = dictionary.onboarding;
  const isOther = subject === OTHER_SUBJECT;
  const accentColor = accent === "green" ? "var(--sb-emerald-dark)" : "var(--sb-teal-dark)";

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-extrabold nb-heading sm:text-3xl" style={{ color: "var(--sb-ink)" }}>
          {title}
        </h2>
        <p className="mt-3" style={{ color: "var(--sb-muted)" }}>{description}</p>
      </div>

      <div className="mt-8">
        <label htmlFor="subject" className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>
          {o.primarySubjectField}
        </label>
        <div className="relative mt-2">
          <select
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="nb-input w-full appearance-none py-3.5 pl-4 pr-11 text-sm"
          >
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === OTHER_SUBJECT ? o.otherSubject : opt}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--sb-muted)" }} />
        </div>

        {isOther && (
          <input
            type="text"
            value={customSubject}
            onChange={(e) => onCustomSubjectChange(e.target.value)}
            placeholder={o.customSubjectPlaceholder}
            autoFocus
            className="nb-input mt-3 w-full px-4 py-3.5 text-sm"
          />
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold" style={{ color: "var(--sb-ink)" }}>{o.selectTagsTitle}</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm transition-colors"
                style={{
                  borderRadius: "999px",
                  boxShadow: isSelected ? "none" : "var(--sb-shadow-sm)",
                  backgroundColor: isSelected ? accentColor : "#ffffff",
                  color: isSelected ? "#ffffff" : "var(--sb-muted)",
                }}
              >
                {isSelected && <Check size={14} />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}