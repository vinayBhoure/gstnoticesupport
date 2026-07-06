'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: React.ReactNode;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className = '', ...props },
  ref,
) {
  const describedBy = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label className={`checkbox-wrapper ${className}`.trim()} htmlFor={id}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="checkbox-control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <span className="checkbox-label">{label}</span>
      </label>
      {error && (
        <p id={describedBy} className="text-sm text-[var(--warning-amber)] ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
