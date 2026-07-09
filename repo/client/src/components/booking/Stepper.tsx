import { Check } from 'lucide-react';

type StepperProps = {
  // 1-based index of the active step.
  currentStep: number;
  steps: readonly string[];
};

// Booking step progress indicator (components.md → Stepper). One of the three
// allowed motion spots (frontend.md §7.5) — 300ms ease-out CSS transitions on
// the bubbles and connectors, per resources/ui/Booking Step 1–3.
export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <ol className="stepper" aria-label="Booking progress">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const state =
          stepNumber < currentStep ? 'complete' : stepNumber === currentStep ? 'active' : 'upcoming';
        const isLast = index === steps.length - 1;

        return (
          <StepItem
            key={label}
            label={label}
            stepNumber={stepNumber}
            state={state}
            connectorComplete={!isLast && stepNumber < currentStep}
            isLast={isLast}
          />
        );
      })}
    </ol>
  );
}

type StepItemProps = {
  label: string;
  stepNumber: number;
  state: 'complete' | 'active' | 'upcoming';
  connectorComplete: boolean;
  isLast: boolean;
};

function StepItem({ label, stepNumber, state, connectorComplete, isLast }: StepItemProps) {
  return (
    <>
      <li className="step" data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
        <div className="step__num" aria-hidden>
          {state === 'complete' ? <Check size={14} strokeWidth={2.8} /> : stepNumber}
        </div>
        <span className="step__label">{label}</span>
      </li>
      {!isLast && (
        <li
          className="step-connector"
          role="presentation"
          aria-hidden
          data-complete={connectorComplete ? 'true' : undefined}
        />
      )}
    </>
  );
}
