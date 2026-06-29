'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  // Renders a fixed "+91" prefix and tel input mode (Form Field Primitives, components.md).
  telPrefix?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', type, telPrefix = false, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    'input',
    error ? 'border-[var(--warning-amber)]' : '',
    telPrefix ? 'input-has-prefix' : '',
    isPassword ? 'input-has-suffix' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = error && id ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--primary-navy)]">
          {label}
        </label>
      )}
      <div className="input-wrap">
        {telPrefix && <span className="input-prefix">+91</span>}
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          className={inputClasses}
          inputMode={telPrefix ? 'tel' : props.inputMode}
          autoComplete={telPrefix ? 'tel' : props.autoComplete}
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
