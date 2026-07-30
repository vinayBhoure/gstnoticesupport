'use client';

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const OTP_LENGTH = 6;

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

// Six single-digit boxes with paste distribution and arrow/backspace navigation
// (components.md → OTP Input). The whole group carries one accessible label.
export function OTPInput({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Mount-only: entering the code is the sole purpose of the OTP screens, so the caret
  // belongs in box 1. Re-focusing on every render would fight the typing navigation.
  useEffect(() => {
    if (autoFocus && !disabled) inputsRef.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only focus
  }, []);

  const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);

  function focusBox(index: number): void {
    inputsRef.current[index]?.focus();
  }

  function commit(next: string[]): void {
    onChange(next.join('').replace(/\s/g, ''));
  }

  function handleChange(index: number, char: string): void {
    const digit = char.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = digits.slice();
    next[index] = digit;
    commit(next);
    focusBox(Math.min(index + 1, OTP_LENGTH - 1));
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]?.trim()) {
        next[index] = ' ';
        commit(next);
      } else if (index > 0) {
        next[index - 1] = ' ';
        commit(next);
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center" role="group" aria-label="6-digit verification code">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digits[i]?.trim() ?? ''}
            disabled={disabled}
            className={`otp-box${error ? ' has-error' : ''}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="text-sm text-[var(--warning-amber)] text-center" role="alert">{error}</p>}
    </div>
  );
}
