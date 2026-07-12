"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";
import ProfileStep from "./ProfileStep";
import SkillsStep, { OTHER_SUBJECT } from "./SkillsStep";
import { getBrowserTimezone } from "@/lib/timezones";

const DEFAULT_TIMEZONE = "Asia/Jakarta";

type OnboardingModalProps = {
  onComplete?: () => void;
  /** Category -> skill names, fetched server-side from the `skills` table. */
  skillsByCategory: Record<string, string[]>;
};

export default function OnboardingModal({ onComplete, skillsByCategory }: OnboardingModalProps) {
  const router = useRouter();
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subjectOptions = [...Object.keys(skillsByCategory), OTHER_SUBJECT];

  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    setTimezone(getBrowserTimezone());
  }, []);

  const [teachSubject, setTeachSubject] = useState(subjectOptions[0]);
  const [teachCustomSubject, setTeachCustomSubject] = useState("");
  const [teachTags, setTeachTags] = useState<string[]>([]);

  const [learnSubject, setLearnSubject] = useState(subjectOptions[0]);
  const [learnCustomSubject, setLearnCustomSubject] = useState("");
  const [learnTags, setLearnTags] = useState<string[]>([]);

  function toggleTag(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  }

  function handleTeachSubjectChange(value: string) {
    setTeachSubject(value);
    setTeachTags([]);
  }

  function handleLearnSubjectChange(value: string) {
    setLearnSubject(value);
    setLearnTags([]);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleContinue() {
    if (step < totalSteps) {
      setStep((s) => s + 1);
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl" style={{ borderRadius: "var(--radius-card)" }}>
        <div className="flex items-center justify-between border-b px-8 py-6" style={{ borderColor: "var(--color-fog)" }}>
          <span className="text-xl font-medium" style={{ fontFamily: "var(--font-heading)", color: "var(--color-brand-blue)" }}>
            SkillBridge
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-mid-gray)" }}>
            Step <span className="font-bold" style={{ color: "var(--color-brand-blue)" }}>{step}</span> of {totalSteps}
          </span>
        </div>

        <div className="px-8 pt-6">
          <OnboardingStepper currentStep={step} totalSteps={totalSteps} />
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {step === 1 && (
            <ProfileStep bio={bio} onBioChange={setBio} timezone={timezone} onTimezoneChange={setTimezone} />
          )}

          {step === 2 && (
            <SkillsStep
              title="What skills can you share?"
              description="Select subjects you feel comfortable teaching to other community peers."
              subjectOptions={subjectOptions}
              subject={teachSubject}
              onSubjectChange={handleTeachSubjectChange}
              customSubject={teachCustomSubject}
              onCustomSubjectChange={setTeachCustomSubject}
              tags={skillsByCategory[teachSubject] ?? []}
              selectedTags={teachTags}
              onToggleTag={(tag) => toggleTag(teachTags, setTeachTags, tag)}
              accent="green"
            />
          )}

          {step === 3 && (
            <SkillsStep
              title="What skills do you want to learn?"
              description="Choose the skills you're looking to learn from the community."
              subjectOptions={subjectOptions}
              subject={learnSubject}
              onSubjectChange={handleLearnSubjectChange}
              customSubject={learnCustomSubject}
              onCustomSubjectChange={setLearnCustomSubject}
              tags={skillsByCategory[learnSubject] ?? []}
              selectedTags={learnTags}
              onToggleTag={(tag) => toggleTag(learnTags, setLearnTags, tag)}
            />
          )}
        </div>

        <div className="border-t px-8 py-6" style={{ borderColor: "var(--color-fog)" }}>
          {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
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
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  {step === totalSteps ? (isSubmitting ? "Finishing..." : "Finish Setup") : "Save & Continue"}
                  <ArrowRight size={16} />
                </span>
              </button>
              <p className="mt-2 text-xs" style={{ color: "var(--color-mid-gray)" }}>You can always update this later.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}