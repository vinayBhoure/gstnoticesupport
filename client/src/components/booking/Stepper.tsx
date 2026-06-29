import { Check } from 'lucide-react';

type StepperProps = {
  // 1-based index of the active step.
  currentStep: number;
  steps: readonly string[];
};

// Booking step progress indicator (design-system §Stepper). One of the three
// allowed motion spots (frontend.md §7.5); kept to simple CSS transitions.
export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="Progress">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isComplete
                    ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-white'
                    : isActive
                      ? 'border-[var(--accent-green)] bg-white text-[var(--accent-green)]'
                      : 'border-[var(--neutral-200)] bg-white text-[var(--neutral-600)]',
                ].join(' ')}
              >
                {isComplete ? <Check size={16} aria-hidden /> : stepNumber}
              </span>
              <span
                className={[
                  'hidden text-sm sm:inline',
                  isActive
                    ? 'font-semibold text-[var(--primary-navy)]'
                    : 'text-[var(--neutral-600)]',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <span
                aria-hidden
                className={[
                  'h-px w-8 transition-colors sm:w-12',
                  isComplete ? 'bg-[var(--accent-green)]' : 'bg-[var(--neutral-200)]',
                ].join(' ')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
