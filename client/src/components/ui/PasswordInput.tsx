'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

// Bare password input with a single visibility toggle (issue #8), for layouts
// that render their own label (e.g. Settings' .form-row two-column rows)
// instead of the labeled Input component's built-in label.
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className = '', ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-wrap">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`input input-has-suffix ${className}`.trim()}
        {...props}
      />
      <button
        type="button"
        className="input-suffix-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
