'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  Lock,
  FileSearch,
  ShieldAlert,
  Scale,
  Landmark,
  Gavel,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { createBookingSchema, type CreateBookingInput } from '@/lib/shared-schemas/booking.schema';
import { bookingApi } from '@/lib/api/booking';
import { getErrorMessage } from '@/lib/api/client';
import type { BookingDetailDTO, ServiceType } from '@/lib/api/types';
import { SERVICE_META, SERVICE_ORDER } from '@/lib/constants/services';
import { bookingRef } from '@/lib/constants/booking-status';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stepper } from '@/components/booking/Stepper';
import { SegmentedToggle } from '@/components/booking/SegmentedToggle';
import { PreDepositNotice, requiresPreDeposit } from '@/components/booking/PreDepositNotice';
import { DocumentUpload } from '@/components/booking/DocumentUpload';

const STEPS = ['Service', 'Details', 'Documents'] as const;

// Card icons per resources/ui/Booking Step 1 (lucide, 36px, 1.5 stroke).
const SERVICE_ICONS: Record<ServiceType, LucideIcon> = {
  asmt_10: FileSearch,
  scn: ShieldAlert,
  commissioner_appeal: Scale,
  gstat_appeal: Landmark,
  representation: Gavel,
};

type FormValues = z.input<typeof createBookingSchema>;

export function NewBookingWizard() {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdBooking, setCreatedBooking] = useState<BookingDetailDTO | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues, unknown, CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      organizationName: '',
      filingFor: 'self',
      gstn: '',
      consentInformationAccurate: false,
      consentContactAuthorized: false,
    },
  });

  const serviceType = useWatch({ control, name: 'serviceType' }) as ServiceType | undefined;
  const filingFor = useWatch({ control, name: 'filingFor' }) ?? 'self';

  const createMutation = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: (booking) => {
      setCreatedBooking(booking);
      setStep(3);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onDetailsSubmit = handleSubmit((data) => createMutation.mutate(data));

  const gstnReg = register('gstn');

  // The prototype rows: ASMT-10 + SCN on top, the two appeals below, with the
  // pre-deposit region animating open between them (KB2 §7 — disclosure applies
  // to the appeal services, per the locked KB; prototype's data-predep flags
  // are inverted and the KB wins).
  const topRow = SERVICE_ORDER.slice(0, 2);
  const bottomRow = SERVICE_ORDER.slice(2, 4);
  const extraRow = SERVICE_ORDER.slice(4);
  const showPredep = requiresPreDeposit(serviceType);

  const stepperStep = submitted ? 4 : step;

  return (
    <div className="flow">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="top-bar" role="banner">
        <Link href="/dashboard" aria-label="GST Notice Support — back to dashboard">
          <Image src="/logo.png" alt="GST Notice Support" width={34} height={34} className="top-bar__logo" />
        </Link>
        <Link
          href={createdBooking ? `/dashboard/bookings/${createdBooking.id}` : '/dashboard'}
          className="btn-exit"
          aria-label="Save progress and exit to dashboard"
        >
          Save &amp; Exit
          <X size={15} aria-hidden />
        </Link>
      </header>

      <nav className="stepper-rail" aria-label="Booking progress">
        <Stepper currentStep={stepperStep} steps={STEPS} />
      </nav>

      <main className="flow-main" id="main">
        {/* Step 1 — Service selection */}
        {step === 1 && (
          <div className="flow-content">
            <h2 className="content__heading">What type of GST notice have you received?</h2>
            <p className="content__sub">Select the service that matches your notice type.</p>

            <div
              role="radiogroup"
              aria-label="Select a GST notice service"
              aria-required
              className="cards-wrapper"
            >
              <div className="cards-row cards-row--top">
                {topRow.map((value) => (
                  <ServiceCard
                    key={value}
                    value={value}
                    isSelected={serviceType === value}
                    onSelect={() => setValue('serviceType', value, { shouldValidate: true })}
                  />
                ))}
              </div>

              <div
                className={`predep-region${showPredep ? ' is-open' : ''}`}
                role="region"
                aria-label="Pre-deposit requirement"
                aria-hidden={!showPredep}
              >
                <div aria-live="polite" aria-atomic>
                  <PreDepositNotice serviceType={serviceType} />
                </div>
              </div>

              <div className="cards-row">
                {bottomRow.map((value) => (
                  <ServiceCard
                    key={value}
                    value={value}
                    isSelected={serviceType === value}
                    onSelect={() => setValue('serviceType', value, { shouldValidate: true })}
                  />
                ))}
              </div>

              {extraRow.length > 0 && (
                <div className="cards-row">
                  {extraRow.map((value) => (
                    <ServiceCard
                      key={value}
                      value={value}
                      isSelected={serviceType === value}
                      onSelect={() => setValue('serviceType', value, { shouldValidate: true })}
                    />
                  ))}
                </div>
              )}
            </div>

            {serviceType === 'representation' && (
              <p className="pricing-note" role="note">
                <CheckCircle size={15} strokeWidth={1.5} className="ic-check" aria-hidden />
                This is a consultation-based service. Our team confirms the fee after reviewing
                your case — you&apos;ll see the exact quote in your dashboard before paying.
              </p>
            )}

            <p className="pricing-note">
              <CheckCircle size={15} strokeWidth={1.5} className="ic-check" aria-hidden />
              Prices are inclusive of all charges. No hidden fees.
            </p>
          </div>
        )}

        {/* Step 2 — Case details */}
        {step === 2 && (
          <div className="flow-content flow-content--sm">
            <h2 className="content__heading">Your Case Details</h2>
            <p className="content__sub">These details will be used to prepare your response.</p>

            <form
              id="booking-form"
              className="booking-form"
              onSubmit={onDetailsSubmit}
              noValidate
            >
              <Input
                id="contactName"
                label="Full Name"
                placeholder="As per PAN / Aadhaar"
                error={errors.contactName?.message}
                {...register('contactName')}
              />
              <Input
                id="contactEmail"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.contactEmail?.message}
                {...register('contactEmail')}
              />
              <Input
                id="contactPhone"
                label="Mobile Number"
                telPrefix
                placeholder="10-digit mobile number"
                maxLength={10}
                error={errors.contactPhone?.message}
                {...register('contactPhone')}
              />
              <Input
                id="gstn"
                label="GSTIN"
                className="input--mono"
                placeholder="e.g. 29ABCDE1234F1Z5"
                maxLength={15}
                spellCheck={false}
                error={errors.gstn?.message}
                {...gstnReg}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  void gstnReg.onChange(e);
                }}
              />
              <Input
                id="organizationName"
                label="Organisation Name (optional)"
                placeholder="Registered business name"
                error={errors.organizationName?.message}
                {...register('organizationName')}
              />

              <div className="field">
                <span className="field__label" id="filing-label">
                  Filing For
                </span>
                <SegmentedToggle
                  ariaLabel="Filing for"
                  value={filingFor}
                  onChange={(v) => setValue('filingFor', v)}
                  options={[
                    { value: 'self', label: 'Myself' },
                    { value: 'others', label: 'A Client' },
                  ]}
                />
              </div>

              <div className="card flex flex-col gap-3 p-4">
                <Checkbox
                  id="consentInformationAccurate"
                  label="I confirm the information provided is accurate."
                  error={errors.consentInformationAccurate?.message}
                  {...register('consentInformationAccurate')}
                />
                <Checkbox
                  id="consentContactAuthorized"
                  label="I am authorized to initiate this service."
                  error={errors.consentContactAuthorized?.message}
                  {...register('consentContactAuthorized')}
                />
              </div>

              <PreDepositNotice serviceType={serviceType} />
            </form>

            <p className="privacy-note" style={{ marginTop: 32 }}>
              <Lock size={15} strokeWidth={1.5} aria-hidden />
              Your details are used only for preparing your GST response. We never share them.
            </p>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && createdBooking && !submitted && (
          <div className="flow-content flow-content--md">
            <h2 className="content__heading">Upload Your Notice Documents</h2>
            <p className="content__sub">
              Upload all relevant notices and orders. Our team will review them before preparing
              your response.
            </p>

            <DocumentUpload
              bookingId={createdBooking.id}
              usedCount={0}
              onUploaded={() => setUploadedCount((c) => c + 1)}
            />

            <div
              className={`summary-region${uploadedCount > 0 ? ' is-open' : ''}`}
              aria-hidden={uploadedCount === 0}
              role="region"
              aria-label="Booking summary"
            >
              <div className="summary-card">
                <div className="summary-card__heading">
                  <ClipboardCheck size={16} strokeWidth={1.5} aria-hidden />
                  Booking Summary
                </div>
                <div className="summary-rows">
                  <div className="summary-row">
                    <span className="summary-row__label">Service</span>
                    <span className="summary-row__value">
                      {SERVICE_META[createdBooking.serviceType].label}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-row__label">Name</span>
                    <span className="summary-row__value">{createdBooking.contactName}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-row__label">GSTIN</span>
                    <span className="summary-row__value summary-row__value--mono">
                      {createdBooking.gstn}
                    </span>
                  </div>
                  {requiresPreDeposit(createdBooking.serviceType) && (
                    <div className="summary-row">
                      <span className="summary-row__label">Pre-deposit</span>
                      <span className="summary-row__value">As per GST Act</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success state — replaces the content area (prototype Step 3) */}
        {submitted && createdBooking && (
          <div className="success-state" role="status" aria-live="assertive">
            <div className="success-icon-ring">
              <Check size={36} strokeWidth={2.2} aria-hidden />
            </div>
            <h2 className="success-heading">Booking Submitted</h2>
            <span className="success-ref">{bookingRef(createdBooking.id)}</span>
            <p className="success-body">
              We&apos;ve received your documents. Our team will review them and update you by
              email.
            </p>
            <Link href="/dashboard" className="btn-continue">
              Go to Dashboard
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
            </Link>
          </div>
        )}
      </main>

      {/* Footer bar — Back | Continue / Submit */}
      {!submitted && (
        <footer className="footer-bar">
          {step === 2 ? (
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep(1)}
              aria-label="Back to Step 1, Service Selection"
            >
              <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
              Back
            </button>
          ) : (
            // Step 1 has no previous step; at Step 3 the booking already
            // exists, so Details can no longer be edited (deviation noted).
            <button
              type="button"
              className="btn-back"
              disabled
              aria-disabled
              aria-label={
                step === 1
                  ? 'Step 1 of 3, no previous step'
                  : 'Booking created — details can no longer be edited'
              }
            >
              <ArrowLeft size={16} strokeWidth={1.8} aria-hidden />
              Back
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              className="btn-continue"
              disabled={!serviceType}
              aria-disabled={!serviceType}
              aria-label="Continue to step 2, Details"
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
            </button>
          )}
          {step === 2 && (
            <button
              type="submit"
              form="booking-form"
              className="btn-continue"
              disabled={createMutation.isPending}
              aria-label="Continue to step 3, Documents"
            >
              {createMutation.isPending ? (
                <span className="spinner" aria-hidden />
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
                </>
              )}
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className="btn-continue"
              disabled={uploadedCount === 0}
              aria-disabled={uploadedCount === 0}
              aria-label={`Submit booking, ${uploadedCount} file${uploadedCount === 1 ? '' : 's'} uploaded`}
              onClick={() => setSubmitted(true)}
            >
              Submit Booking
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

type ServiceCardProps = {
  value: ServiceType;
  isSelected: boolean;
  onSelect: () => void;
};

// Notice Type Selector Card (components.md) per resources/ui/Booking Step 1.
function ServiceCard({ value, isSelected, onSelect }: ServiceCardProps) {
  const meta = SERVICE_META[value];
  const Icon = SERVICE_ICONS[value];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className="service-card"
      onClick={onSelect}
    >
      <div className="card__check" aria-hidden>
        <Check size={13} strokeWidth={2.8} color="#fff" />
      </div>
      <Icon size={36} strokeWidth={1.5} className="card__icon" aria-hidden />
      <div>
        <p className="card__name">{meta.label}</p>
        <p className="card__desc">{meta.description}</p>
      </div>
      <div className="card__price">{meta.priceDisplay}</div>
    </button>
  );
}
