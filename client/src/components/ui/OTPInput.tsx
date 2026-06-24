'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const OTP_LENGTH = 6;

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function OTPInput({ value, onChange, error, disabled = false }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH);

  function focusNext(index: number): void {
    inputsRef.current[index + 1]?.focus();
  }

  function focusPrev(index: number): void {
    inputsRef.current[index - 1]?.focus();
  }

  function handleChange(index: number, char: string): void {
    if (!/^\d$/.test(char)) return;
    const next = digits.slice();
    next[index] = char;
    onChange(next.join('').replace(/\s/g, ''));
    focusNext(index);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
        onChange(next.join('').trimEnd());
      } else {
        focusPrev(index);
        if (index > 0) {
          next[index - 1] = '';
          onChange(next.join('').trimEnd());
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNext(index);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[nextFocus]?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-center">
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
            value={digits[i] ?? ''}
            disabled={disabled}
            className={`otp-box${error ? ' has-error' : ''}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-[var(--warning-amber)] text-center">{error}</p>
      )}
    </div>
  );
}
