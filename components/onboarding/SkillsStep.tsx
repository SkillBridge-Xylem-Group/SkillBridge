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
}: SkillsStepProps) {
  const isOther = subject === OTHER_SUBJECT;

  return (
    <div>
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-3 text-slate-500">{description}</p>
      </div>

      <div className="mt-8">
        <label htmlFor="subject" className="text-sm font-bold text-slate-900">
          Primary Subject Field
        </label>
        <div className="relative mt-2">
          <select
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3.5 pl-4 pr-11 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {isOther && (
          <input
            type="text"
            value={customSubject}
            onChange={(e) => onCustomSubjectChange(e.target.value)}
            placeholder="Tell us your subject field"
            autoFocus
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-slate-900">Select Tags to Feature on Your Profile</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`btn-pill flex items-center gap-1.5 border px-4 py-2 text-sm ${
                  isSelected
                    ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand"
                }`}
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