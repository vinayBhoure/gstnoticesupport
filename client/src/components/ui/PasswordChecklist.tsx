'use client';

import { Check, X } from 'lucide-react';
import {
  PASSWORD_RULES,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  passwordStrength,
} from '@/lib/password-strength';

type PasswordChecklistProps = {
  password: string;
  // Hidden until the user starts typing, so an untouched field is not pre-scolded.
  showStrengthMeter?: boolean;
};

export function PasswordChecklist({ password, showStrengthMeter = true }: PasswordChecklistProps) {
  const score = passwordStrength(password);

  if (!password) {
    return (
      <p className="field-hint">
        Minimum 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {showStrengthMeter && (
        <div className="strength-row" aria-hidden>
          <div className="strength-track">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="strength-seg"
                style={{
                  background: i < score ? STRENGTH_COLORS[score - 1] : 'var(--neutral-200)',
                }}
              />
            ))}
          </div>
          <span className="strength-lbl" style={{ color: score ? STRENGTH_COLORS[score - 1] : undefined }}>
            {STRENGTH_LABELS[score - 1] ?? ''}
          </span>
        </div>
      )}

      {/* aria-live so a screen reader hears rules being satisfied as they type. */}
      <ul className="flex flex-col gap-1" aria-live="polite">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.label}
              className="flex items-center gap-1.5 text-[13px]"
              style={{ color: passed ? 'var(--accent-green)' : 'var(--neutral-600)' }}
            >
              {passed ? (
                <Check size={14} className="shrink-0" aria-hidden />
              ) : (
                <X size={14} className="shrink-0" aria-hidden />
              )}
              <span>{rule.label}</span>
              <span className="sr-only">{passed ? '— met' : '— not met'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
