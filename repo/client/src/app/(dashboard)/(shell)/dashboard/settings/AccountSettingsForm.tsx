'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/shared-schemas/user.schema';
import { userApi } from '@/lib/api/user';
import { getErrorMessage } from '@/lib/api/client';

type AccountSettingsFormProps = {
  name: string;
  email: string;
  phone: string | null;
  allowPromotions: boolean;
};

// Account section per resources/ui/Settings.html — edits name, mobile, and the
// marketing-email preference (PATCH /user/profile). Email is read-only: it is the
// sign-in identity and is never editable here (D67).
export function AccountSettingsForm({ name, email, phone, allowPromotions }: AccountSettingsFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name, phone: phone ?? '', allowPromotions },
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => userApi.updateProfile(data),
    onSuccess: (user) => {
      reset({ name: user.name, phone: user.phone ?? '', allowPromotions: user.allowPromotions });
      toast.success('Profile updated.');
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Full name</div>
          <div className="desc">Appears on your account and case correspondence.</div>
        </div>
        <div className="fld">
          <input type="text" className="input" autoComplete="name" {...register('name')} />
          {errors.name && (
            <span className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.name.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Email address</div>
          <div className="desc">Your sign-in email. Contact support to change it.</div>
        </div>
        <div className="fld">
          <div className="ro-field">
            <span className="v">{email}</span>
            <span className="verify-badge">
              <Check size={11} aria-hidden />
              Sign-in
            </span>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Mobile number</div>
          <div className="desc">Used for OTP login and WhatsApp updates.</div>
        </div>
        <div className="fld">
          <input
            type="tel"
            className="input"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 9800011122"
            {...register('phone', { setValueAs: (v) => (v === '' ? undefined : v) })}
          />
          {errors.phone && (
            <span className="text-sm text-[var(--warning-amber)]" role="alert">
              {errors.phone.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="lbl">
          <div className="ttl">Promotional updates</div>
          <div className="desc">Offers and service announcements by email. Never about your case.</div>
        </div>
        <div className="fld">
          <label className="toggle" style={{ alignSelf: 'flex-start' }}>
            <input type="checkbox" {...register('allowPromotions')} />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="save-bar">
        <button
          type="submit"
          className="btn btn-primary"
          style={{ minHeight: 42 }}
          disabled={mutation.isPending || !isDirty}
        >
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
