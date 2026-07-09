'use client';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedToggleProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
};

// Segmented control per resources/ui/Booking Step 2 → .seg-toggle. Controlled —
// the parent owns the value, so it composes with React Hook Form via setValue.
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="seg-toggle">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className="seg-btn"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
