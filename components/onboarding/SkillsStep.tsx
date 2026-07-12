import { Check, ChevronDown } from "lucide-react";

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
  const isOther = subject === OTHER_SUBJECT;
  const accentColor = accent === "green" ? "var(--color-brand-green)" : "var(--color-brand-blue)";

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-medium sm:text-3xl" style={{ fontFamily: "var(--font-heading)", color: "var(--color-carbon)" }}>
          {title}
        </h2>
        <p className="mt-3" style={{ color: "var(--color-charcoal)" }}>{description}</p>
      </div>

      <div className="mt-8">
        <label htmlFor="subject" className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>
          Primary Subject Field
        </label>
        <div className="relative mt-2">
          <select
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full appearance-none border bg-white py-3.5 pl-4 pr-11 text-sm focus:outline-none"
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-fog)")}
          >
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-mid-gray)" }} />
        </div>

        {isOther && (
          <input
            type="text"
            value={customSubject}
            onChange={(e) => onCustomSubjectChange(e.target.value)}
            placeholder="Tell us your subject field"
            autoFocus
            className="mt-3 w-full border px-4 py-3.5 text-sm placeholder:text-slate-400 focus:outline-none"
            style={{ borderColor: "var(--color-fog)", borderRadius: "12px", color: "var(--color-carbon)" }}
          />
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium" style={{ color: "var(--color-carbon)" }}>Select Tags to Feature on Your Profile</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className="flex items-center gap-1.5 border px-4 py-2 text-sm transition-colors"
                style={{
                  borderRadius: "999px",
                  borderColor: isSelected ? accentColor : "var(--color-fog)",
                  backgroundColor: isSelected ? accentColor : "#ffffff",
                  color: isSelected ? "#ffffff" : "var(--color-charcoal)",
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