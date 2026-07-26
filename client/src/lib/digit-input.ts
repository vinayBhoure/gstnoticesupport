import type { KeyboardEvent } from 'react';

// Keys that must pass through even though they aren't digits — editing,
// navigation, and platform shortcuts (copy/paste/select-all/undo).
const ALLOWED_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock',
]);

// Rejects a keystroke before it lands in the input — the primary defence for
// mobile-number fields (issue #4: reject alphabetic/special characters).
export function blockNonDigitKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // let shortcuts through
  if (ALLOWED_KEYS.has(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
}

// Backstop for paste, drag-drop, autofill, and IME input, which onKeyDown
// cannot catch — strips everything but digits and caps the length.
export function stripNonDigits(value: string, maxLength = 10): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
