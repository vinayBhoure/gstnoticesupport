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

// Two-or-more option segmented control (Booking Step 2 prototype). Controlled —
// the parent owns the value, so it composes with React Hook Form via setValue.
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full overflow-hidden rounded-[var(--r-btn)] border border-[var(--neutral-200)]"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'min-h-[44px] flex-1 px-4 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--accent-green)] text-white'
                : 'bg-white text-[var(--neutral-900)] hover:bg-[var(--neutral-50)]',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
