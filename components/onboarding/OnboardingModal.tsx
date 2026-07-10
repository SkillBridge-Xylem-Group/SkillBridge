"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";
import ProfileStep from "./ProfileStep";
import SkillsStep, { OTHER_SUBJECT } from "./SkillsStep";
import { getBrowserTimezone } from "@/lib/timezones";

// Fixed default so server and client render the same thing on first paint.
// The real browser timezone is detected client-side after mount (see
// useEffect below) — computing it during SSR risks a hydration mismatch if
// the server's timezone differs from the visitor's.
const DEFAULT_TIMEZONE = "Asia/Jakarta";

const TEACH_SUBJECTS = [
  "Software Development (Web, Mobile)",
  "Design & UI/UX",
  "Business & Marketing",
  "Languages",
  "Music",
  "Cooking",
  OTHER_SUBJECT,
];

const TEACH_TAGS = [
  "HTML/CSS",
  "JavaScript",
  "UI Layouts",
  "Database ERD",
  "Python",
  "React",
  "Figma",
  "Wireframing",
  "Copywriting",
  "Project Management",
];

const LEARN_SUBJECTS = [
  "Design & UI/UX",
  "Software Development (Web, Mobile)",
  "Business & Marketing",
  "Languages",
  "Music",
  "Cooking",
  OTHER_SUBJECT,
];

const LEARN_TAGS = [
  "Figma",
  "Wireframing",
  "UI Design",
  "Graphic Design",
  "Canva",
  "User Research",
  "Prototyping",
  "Adobe XD",
  "Illustrator",
  "Branding",
];

type OnboardingModalProps = {
  /**
   * Called when the user finishes step 3. Pass this when rendering the
   * modal as an overlay on top of another page (e.g. the dashboard) so it
   * can just close instead of navigating. If omitted, it redirects to
   * /dashboard on completion.
   */
  onComplete?: () => void;
};

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    setTimezone(getBrowserTimezone());
  }, []);

  const [teachSubject, setTeachSubject] = useState(TEACH_SUBJECTS[0]);
  const [teachCustomSubject, setTeachCustomSubject] = useState("");
  const [teachTags, setTeachTags] = useState<string[]>(["HTML/CSS", "JavaScript", "UI Layouts", "Database ERD"]);

  const [learnSubject, setLearnSubject] = useState(LEARN_SUBJECTS[0]);
  const [learnCustomSubject, setLearnCustomSubject] = useState("");
  const [learnTags, setLearnTags] = useState<string[]>(["Figma", "Wireframing", "UI Design"]);

  function toggleTag(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleContinue() {
    if (step < totalSteps) {
      setStep((s) => s + 1);
      return;
    }

    // Final step: persist onboarding data
    setError("");
    setIsSubmitting(true);
    try {
      const finalTeachSubject = teachSubject === OTHER_SUBJECT ? teachCustomSubject : teachSubject;
      const finalLearnSubject = learnSubject === OTHER_SUBJECT ? learnCustomSubject : learnSubject;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          timezone,
          teachSubject: finalTeachSubject,
          teachTags,
          learnSubject: finalLearnSubject,
          learnTags,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to save onboarding. Please try again.");
        return;
      }

      if (onComplete) {
        onComplete();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <span className="text-xl font-extrabold text-brand">SkillBridge</span>
          <span className="text-sm font-semibold text-slate-500">
            Step <span className="font-bold text-brand">{step}</span> of {totalSteps}
          </span>
        </div>

        {/* Stepper */}
        <div className="px-8 pt-6">
          <OnboardingStepper currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {step === 1 && (
            <ProfileStep bio={bio} onBioChange={setBio} timezone={timezone} onTimezoneChange={setTimezone} />
          )}

          {step === 2 && (
            <SkillsStep
              title="What skills can you share?"
              description="Select subjects you feel comfortable teaching to other community peers."
              subjectOptions={TEACH_SUBJECTS}
              subject={teachSubject}
              onSubjectChange={setTeachSubject}
              customSubject={teachCustomSubject}
              onCustomSubjectChange={setTeachCustomSubject}
              tags={TEACH_TAGS}
              selectedTags={teachTags}
              onToggleTag={(tag) => toggleTag(teachTags, setTeachTags, tag)}
            />
          )}

          {step === 3 && (
            <SkillsStep
              title="What skills do you want to learn?"
              description="Choose the skills you're looking to learn from the community."
              subjectOptions={LEARN_SUBJECTS}
              subject={learnSubject}
              onSubjectChange={setLearnSubject}
              customSubject={learnCustomSubject}
              onCustomSubjectChange={setLearnCustomSubject}
              tags={LEARN_TAGS}
              selectedTags={learnTags}
              onToggleTag={(tag) => toggleTag(learnTags, setLearnTags, tag)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-6">
          {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn-pill border-2 border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back
              </span>
            </button>

            <div className="text-right">
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className="btn-pill bg-brand px-8 py-3.5 text-sm text-white shadow-lg shadow-brand/30 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  {step === totalSteps ? (isSubmitting ? "Finishing..." : "Finish Setup") : "Save & Continue"}
                  <ArrowRight size={16} />
                </span>
              </button>
              <p className="mt-2 text-xs text-slate-400">You can always update this later.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}