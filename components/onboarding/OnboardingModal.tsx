"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
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
  const { dictionary } = useLocale();
  const o = dictionary.onboarding;
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
    setError("");
    if (step > 1) setStep((s) => s - 1);
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!bio.trim()) return o.errorBioRequired;
    }
    if (step === 2) {
      if (teachSubject === OTHER_SUBJECT && !teachCustomSubject.trim()) {
        return o.errorSubjectRequired;
      }
      if (teachTags.length === 0) {
        return o.errorTeachTagsRequired;
      }
    }
    if (step === 3) {
      if (learnSubject === OTHER_SUBJECT && !learnCustomSubject.trim()) {
        return o.errorSubjectRequired;
      }
      if (learnTags.length === 0) {
        return o.errorLearnTagsRequired;
      }
    }
    return null;
  }

  async function handleContinue() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    if (step < totalSteps) {
      setStep((s) => s + 1);
      return;
    }

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
        setError(data?.error ?? o.errorSaveFailed);
        return;
      }

      if (onComplete) {
        onComplete();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(o.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white" style={{ boxShadow: "var(--sb-shadow-lg)" }}>
        <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: "1px solid #eef7f0" }}>
          <span className="text-xl font-extrabold nb-heading" style={{ color: "var(--sb-teal-dark)" }}>
            SkillBridge
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--sb-muted)" }}>
            {o.stepLabel} <span className="font-bold" style={{ color: "var(--sb-teal-dark)" }}>{step}</span> {o.ofLabel} {totalSteps}
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
              title={o.teachTitle}
              description={o.teachDescription}
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
              title={o.learnTitle}
              description={o.learnDescription}
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

        <div className="px-8 py-6" style={{ borderTop: "1px solid #eef7f0" }}>
          {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="nb-btn bg-white px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--sb-ink)" }}
            >
              <span className="flex items-center gap-2">
                <ArrowLeft size={16} />
                {o.back}
              </span>
            </button>

            <div className="text-right">
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className="nb-btn px-6 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "var(--sb-gradient)" }}
              >
                <span className="flex items-center gap-2">
                  {step === totalSteps ? (isSubmitting ? o.finishing : o.finishSetup) : o.saveContinue}
                  <ArrowRight size={16} />
                </span>
              </button>
              <p className="mt-2 text-xs" style={{ color: "var(--sb-muted)" }}>{o.updateLaterHint}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}