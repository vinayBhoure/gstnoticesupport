'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

export function LogoutButton() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      router.push('/login');
      router.refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Logging out…' : 'Log out'}
    </button>
  );
}
