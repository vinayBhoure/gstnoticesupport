"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputClasses = ["input", error ? "border-[var(--warning-amber)]" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--neutral-900)]">
          {label}
        </label>
      )}
      <input id={id} className={inputClasses} {...props} />
      {error && <p className="text-sm text-[var(--warning-amber)]">{error}</p>}
    </div>
  );
}
