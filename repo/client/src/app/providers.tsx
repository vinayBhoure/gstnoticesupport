'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

type ProvidersProps = {
  children: React.ReactNode;
};

// Mounted in the root layout. Server Component children are passed through the
// `children` slot, so marketing pages remain SSG — only client components that
// call useQuery/useMutation opt into this context.
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
