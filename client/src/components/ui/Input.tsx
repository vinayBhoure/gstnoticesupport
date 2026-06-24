'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  telPrefix?: boolean;
};

export function Input({
  label,
  error,
  id,
  className = '',
  type,
  telPrefix = false,
  ...props
}: InputProps) {
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

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--neutral-900)]">
          {label}
        </label>
      )}
      <div className="input-wrap">
        {telPrefix && <span className="input-prefix">+91</span>}
        <input
          id={id}
          type={resolvedType}
          className={inputClasses}
          inputMode={telPrefix ? 'tel' : props.inputMode}
          autoComplete={telPrefix ? 'tel' : props.autoComplete}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-suffix-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[var(--warning-amber)]">{error}</p>}
    </div>
  );
}
