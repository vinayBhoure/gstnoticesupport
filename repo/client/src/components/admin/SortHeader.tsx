'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

type SortHeaderProps = {
  field: 'createdAt' | 'updatedAt';
  label: string;
  // The field the table sorts by when no sortBy param is present.
  defaultField: 'createdAt' | 'updatedAt';
};

// Sortable column header per resources/ui/Admin Bookings.html → .sort-btn.
// Click toggles direction on the active field, or activates the field desc-first.
export function SortHeader({ field, label, defaultField }: SortHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = (searchParams.get('sortBy') as SortHeaderProps['field'] | null) ?? defaultField;
  const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc';
  const isActive = sortBy === field;

  function onClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', field);
    params.set('sortDir', isActive && sortDir === 'desc' ? 'asc' : 'desc');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  const Icon = !isActive ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown;
  const dirWord = sortDir === 'asc' ? 'ascending' : 'descending';

  return (
    <button
      type="button"
      className="sort-btn"
      data-active={isActive ? sortDir : undefined}
      aria-label={`Sort by ${label.toLowerCase()}${isActive ? `, currently ${dirWord}` : ''}`}
      onClick={onClick}
    >
      {label}
      <Icon className="si" aria-hidden />
    </button>
  );
}
