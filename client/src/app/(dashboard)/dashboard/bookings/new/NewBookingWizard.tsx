'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { createBookingSchema, type CreateBookingInput } from '@/lib/shared-schemas/booking.schema';
import { bookingApi } from '@/lib/api/booking';
import { getErrorMessage } from '@/lib/api/client';
import type { BookingDetailDTO, ServiceType } from '@/lib/api/types';
import { SERVICE_META, SERVICE_ORDER } from '@/lib/constants/services';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stepper } from '@/components/booking/Stepper';
import { SegmentedToggle } from '@/components/booking/SegmentedToggle';
import { PreDepositNotice, requiresPreDeposit } from '@/components/booking/PreDepositNotice';
import { DocumentUpload } from '@/components/booking/DocumentUpload';

const STEPS = ['Service', 'Details', 'Documents'] as const;

type FormValues = z.input<typeof createBookingSchema>;

export function NewBookingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdBooking, setCreatedBooking] = useState<BookingDetailDTO | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);

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

  return (
    <main className="min-h-screen bg-[var(--neutral-50)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--primary-navy)]">Start a service</h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--neutral-600)] hover:text-[var(--neutral-900)]"
          >
            Save &amp; exit
          </Link>
        </div>

        <div className="mb-8">
          <Stepper currentStep={step} steps={STEPS} />
        </div>

        {/* Step 1 — Service selection */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--primary-navy)]">
                Which service do you need?
              </h2>
              <p className="mt-1 text-sm text-[var(--neutral-600)]">
                Select the GST matter you need help with.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_ORDER.map((value) => {
                const meta = SERVICE_META[value];
                const isSelected = serviceType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() =>
                      setValue('serviceType', value, { shouldValidate: true })
                    }
                    className={[
                      'card relative flex flex-col gap-1 p-5 text-left transition-colors',
                      isSelected
                        ? 'border-2 border-[var(--accent-green)] bg-[var(--neutral-50)]'
                        : 'border border-[var(--neutral-200)] hover:border-[var(--primary-deep-blue)]',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <Check
                        size={18}
                        className="absolute right-4 top-4 text-[var(--accent-green)]"
                        aria-hidden
                      />
                    )}
                    <span className="font-semibold text-[var(--primary-navy)]">{meta.label}</span>
                    <span className="text-sm text-[var(--neutral-600)]">{meta.description}</span>
                  </button>
                );
              })}
            </div>

            <PreDepositNotice serviceType={serviceType} />

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!serviceType}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Case details */}
        {step === 2 && (
          <form onSubmit={onDetailsSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--primary-navy)]">Case details</h2>
              <p className="mt-1 text-sm text-[var(--neutral-600)]">
                We use these details to prepare and file your reply.
              </p>
            </div>

            <Input
              id="contactName"
              label="Full name"
              error={errors.contactName?.message}
              {...register('contactName')}
            />
            <Input
              id="contactEmail"
              label="Email address"
              type="email"
              error={errors.contactEmail?.message}
              {...register('contactEmail')}
            />
            <Input
              id="contactPhone"
              label="Phone number"
              telPrefix
              error={errors.contactPhone?.message}
              {...register('contactPhone')}
            />
            <Input
              id="gstn"
              label="GSTIN"
              className="font-mono uppercase"
              error={errors.gstn?.message}
              {...gstnReg}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                void gstnReg.onChange(e);
              }}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--primary-navy)]">Filing for</span>
              <SegmentedToggle
                ariaLabel="Filing for"
                value={filingFor}
                onChange={(v) => setValue('filingFor', v)}
                options={[
                  { value: 'self', label: 'Myself' },
                  { value: 'others', label: 'On behalf of client' },
                ]}
              />
            </div>

            <Input
              id="organizationName"
              label="Organization name (optional)"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <div className="flex flex-col gap-3 rounded-[var(--r-card)] border border-[var(--neutral-200)] bg-white p-4">
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

            <div className="flex justify-between">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && createdBooking && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--primary-navy)]">
                Upload your documents
              </h2>
              <p className="mt-1 text-sm text-[var(--neutral-600)]">
                Add the notice and any supporting documents. You can also do this later from your
                booking.
              </p>
            </div>

            <DocumentUpload
              bookingId={createdBooking.id}
              usedCount={0}
              onUploaded={() => setUploadedCount((c) => c + 1)}
            />

            <div className="card card-elev flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--neutral-600)]">Service</span>
                <span className="text-sm font-medium text-[var(--primary-navy)]">
                  {SERVICE_META[createdBooking.serviceType].label}
                </span>
              </div>
              {requiresPreDeposit(createdBooking.serviceType) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--neutral-600)]">Pre-deposit</span>
                  <span className="text-sm text-[var(--neutral-900)]">As per GST Act</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                router.push(`/dashboard/bookings/${createdBooking.id}`);
                router.refresh();
              }}
            >
              {uploadedCount > 0 ? 'Go to my booking' : 'Skip for now — go to my booking'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
