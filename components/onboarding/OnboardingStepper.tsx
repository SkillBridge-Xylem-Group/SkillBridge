type OnboardingStepperProps = {
  currentStep: number;
  totalSteps?: number;
};

export default function OnboardingStepper({ currentStep, totalSteps = 3 }: OnboardingStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((step, i) => {
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        const isFilled = isDone || isActive;

        return (
          <div key={step} className="flex flex-1 items-center gap-3 last:flex-initial">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: isFilled ? "var(--color-brand-blue)" : "var(--color-fog)",
                color: isFilled ? "#ffffff" : "var(--color-mid-gray)",
              }}
            >
              {step}
            </div>
            {step !== totalSteps && (
              <div
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: isDone ? "var(--color-brand-blue)" : "var(--color-fog)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}