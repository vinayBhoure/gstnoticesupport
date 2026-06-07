'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import styles from './contact.module.css';

type Fields = {
  name: string;
  mobile: string;
  email: string;
  query: string;
};

type Errors = Partial<Fields>;

function validate(data: Fields): Errors {
  const e: Errors = {};
  if (!data.name.trim() || data.name.trim().length < 2)
    e.name = 'Please enter your full name (at least 2 characters).';
  if (!/^[6-9]\d{9}$/.test(data.mobile.trim()))
    e.mobile = 'Enter a valid 10-digit Indian mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    e.email = 'Enter a valid email address.';
  if (!data.query.trim() || data.query.trim().length < 20)
    e.query = 'Please describe your query (at least 20 characters).';
  return e;
}

const EMPTY: Fields = { name: '', mobile: '', email: '', query: '' };

export function ContactForm() {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function onChange(field: keyof Fields) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    // TODO: Replace with POST /api/v1/contact when EP3 backend endpoint is ready.
    await new Promise(r => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.successState}>
        <div className={styles.successIcon} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h4 className={styles.successTitle}>Message Received</h4>
        <p className={styles.successBody}>
          Thank you, <strong>{form.name.trim()}</strong>. We&apos;ve received your query and will
          respond within 24 hours on working days.
        </p>
        <button
          type="button"
          className={`btn btn-secondary ${styles.resetBtn}`}
          onClick={() => { setForm(EMPTY); setErrors({}); setSubmitted(false); }}
        >
          Send Another Query
        </button>
      </div>
    );
  }

  return (
    <form className={styles.contactForm} onSubmit={onSubmit} noValidate aria-label="Contact form">
      <div className={styles.formGroup}>
        <label htmlFor="cf-name" className={styles.formLabel}>
          Full Name <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <input
          id="cf-name"
          className={`input${errors.name ? ` ${styles.inputErr}` : ''}`}
          type="text"
          placeholder="e.g. Rajesh Kumar"
          value={form.name}
          onChange={onChange('name')}
          autoComplete="name"
          aria-describedby={errors.name ? 'err-name' : undefined}
        />
        {errors.name && <p id="err-name" className={styles.errMsg} role="alert">{errors.name}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-mobile" className={styles.formLabel}>
          Mobile Number <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <input
          id="cf-mobile"
          className={`input${errors.mobile ? ` ${styles.inputErr}` : ''}`}
          type="tel"
          placeholder="10-digit mobile number"
          value={form.mobile}
          onChange={onChange('mobile')}
          autoComplete="tel"
          maxLength={10}
          inputMode="numeric"
          aria-describedby={errors.mobile ? 'err-mobile' : undefined}
        />
        {errors.mobile && <p id="err-mobile" className={styles.errMsg} role="alert">{errors.mobile}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-email" className={styles.formLabel}>
          Email Address <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <input
          id="cf-email"
          className={`input${errors.email ? ` ${styles.inputErr}` : ''}`}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange('email')}
          autoComplete="email"
          aria-describedby={errors.email ? 'err-email' : undefined}
        />
        {errors.email && <p id="err-email" className={styles.errMsg} role="alert">{errors.email}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-query" className={styles.formLabel}>
          Query / Message <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-query"
          className={`input ${styles.formTextarea}${errors.query ? ` ${styles.inputErr}` : ''}`}
          placeholder="Describe your GST notice or query in brief…"
          value={form.query}
          onChange={onChange('query')}
          rows={5}
          aria-describedby={errors.query ? 'err-query' : undefined}
        />
        {errors.query && <p id="err-query" className={styles.errMsg} role="alert">{errors.query}</p>}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Query'}
      </button>
    </form>
  );
}
