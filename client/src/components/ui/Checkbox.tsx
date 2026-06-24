'use client';

import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: React.ReactNode;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className={`checkbox-wrapper ${className}`} htmlFor={id}>
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="checkbox-control"
            {...props}
          />
          <span className="checkbox-label">{label}</span>
        </label>
        {error && <p className="text-sm text-[var(--warning-amber)] ml-7">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
