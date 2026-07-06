'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

// Search-only controls bar per resources/ui/Admin Users.html.
export function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('search', value);
    else params.delete('search');
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function onChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(value.trim()), 350);
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className="controls-bar" role="search" aria-label="Search users">
      <div className="search-wrap">
        <Search className="ic-search" aria-hidden />
        <input
          type="search"
          className="input"
          placeholder="Search by name or email"
          aria-label="Search by name or email"
          autoComplete="off"
          value={search}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {search && (
        <button
          className="btn-tertiary"
          type="button"
          onClick={() => {
            setSearch('');
            if (debounceRef.current) clearTimeout(debounceRef.current);
            push('');
          }}
        >
          <X size={14} aria-hidden />
          Clear
        </button>
      )}
    </div>
  );
}
