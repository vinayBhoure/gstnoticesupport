'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  // Renders the separated "+91" prefix block and tel input mode
  // (components.md → Form Field Primitive, resources/ui phone-wrap pattern).
  telPrefix?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', type, telPrefix = false, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const describedBy = error && id ? `${id}-error` : undefined;

  if (telPrefix) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="field__label">
            {label}
          </label>
        )}
        <div className={`phone-wrap${error ? ' is-error' : ''}`}>
          <span className="phone-prefix" aria-hidden>
            +91
          </span>
          <input
            ref={ref}
            id={id}
            type={resolvedType ?? 'tel'}
            className={`phone-input ${className}`.trim()}
            inputMode="tel"
            autoComplete={props.autoComplete ?? 'tel'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        {error && (
          <p id={describedBy} className="text-sm text-[var(--warning-amber)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const inputClasses = [
    'input',
    error ? 'border-[var(--warning-amber)]' : '',
    isPassword ? 'input-has-suffix' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--primary-navy)]">
          {label}
        </label>
      )}
      <div className="input-wrap">
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          className={inputClasses}
          inputMode={props.inputMode}
          autoComplete={props.autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-suffix-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={describedBy} className="text-sm text-[var(--warning-amber)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
