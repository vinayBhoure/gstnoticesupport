'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { contactSchema, type ContactFormData } from '@/lib/schemas/contact.schema';
import styles from './contact.module.css';

/*
 * EmailJS template must define these variables:
 *   {{user_name}}   — sender's full name
 *   {{user_mobile}} — sender's mobile number
 *   {{user_email}}  — sender's email (set as Reply-To in template)
 *   {{user_query}}  — the message / query text
 *
 * Set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
 * and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in .env.local (see .env.example).
 */

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          user_name: data.name,
          user_mobile: data.mobile,
          user_email: data.email,
          user_query: data.query,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setSubmittedName(data.name.trim());
      setSubmitted(true);
    } catch {
      toast.error('Could not send your message. Please try again or call us directly.');
    }
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
          Thank you, <strong>{submittedName}</strong>. We&apos;ve received your query and will
          respond within 24 hours on working days.
        </p>
        <button
          type="button"
          className={`btn btn-secondary ${styles.resetBtn}`}
          onClick={() => { reset(); setSubmitted(false); setSubmittedName(''); }}
        >
          Send Another Query
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.contactForm}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Contact form"
    >
      <div className={styles.formGroup}>
        <label htmlFor="cf-name" className={styles.formLabel}>
          Full Name <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <input
          id="cf-name"
          className={`input${errors.name ? ` ${styles.inputErr}` : ''}`}
          type="text"
          placeholder="e.g. Rajesh Kumar"
          autoComplete="name"
          aria-describedby={errors.name ? 'err-name' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="err-name" className={styles.errMsg} role="alert">
            {errors.name.message}
          </p>
        )}
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
          autoComplete="tel"
          maxLength={10}
          inputMode="numeric"
          aria-describedby={errors.mobile ? 'err-mobile' : undefined}
          {...register('mobile')}
        />
        {errors.mobile && (
          <p id="err-mobile" className={styles.errMsg} role="alert">
            {errors.mobile.message}
          </p>
        )}
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
          autoComplete="email"
          aria-describedby={errors.email ? 'err-email' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="err-email" className={styles.errMsg} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-query" className={styles.formLabel}>
          Query / Message <span className={styles.required} aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-query"
          className={`input ${styles.formTextarea}${errors.query ? ` ${styles.inputErr}` : ''}`}
          placeholder="Describe your GST notice or query in brief…"
          rows={5}
          aria-describedby={errors.query ? 'err-query' : undefined}
          {...register('query')}
        />
        {errors.query && (
          <p id="err-query" className={styles.errMsg} role="alert">
            {errors.query.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Query'}
      </button>
    </form>
  );
}
