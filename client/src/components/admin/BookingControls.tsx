'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, X } from 'lucide-react';
import { SERVICE_META, SERVICE_ORDER } from '@/lib/constants/services';

const STATUS_OPTIONS = [
  ['document_upload', 'Document Upload'],
  ['in_review', 'In Review'],
  ['draft_ready', 'Draft Ready'],
  ['filing', 'Filing'],
  ['complete', 'Complete'],
  ['cancelled', 'Cancelled'],
] as const;

const PAYMENT_OPTIONS = [
  ['pending', 'Pending'],
  ['paid', 'Paid'],
  ['failed', 'Failed'],
] as const;

// Controls bar per resources/ui/Admin Bookings.html — search + three filter
// selects, all URL-driven so the RSC page refetches on change.
export function BookingControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = searchParams.get('status') ?? '';
  const serviceType = searchParams.get('serviceType') ?? '';
  const paymentStatus = searchParams.get('paymentStatus') ?? '';
  const hasActive = Boolean(search || status || serviceType || paymentStatus);

  function pushParams(update: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(update)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page'); // any filter change resets to page 1
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  // Debounced search → URL (350ms after typing stops).
  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: value.trim() }), 350);
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  function clearFilters() {
    setSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.replace(pathname);
  }

  return (
    <div className="controls-bar" role="search" aria-label="Filter bookings">
      <div className="search-wrap">
        <Search className="ic-search" aria-hidden />
        <input
          type="search"
          className="input"
          placeholder="Search by name or email"
          aria-label="Search by name or email"
          autoComplete="off"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="select-wrap">
        <select
          className={`filter-select${status ? ' active' : ''}`}
          aria-label="Filter by status"
          value={status}
          onChange={(e) => pushParams({ status: e.target.value })}
        >
          <option value="">Status</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="ic-chev" aria-hidden />
      </div>

      <div className="select-wrap">
        <select
          className={`filter-select${serviceType ? ' active' : ''}`}
          aria-label="Filter by service"
          value={serviceType}
          onChange={(e) => pushParams({ serviceType: e.target.value })}
        >
          <option value="">Service</option>
          {SERVICE_ORDER.map((value) => (
            <option key={value} value={value}>
              {SERVICE_META[value].label}
            </option>
          ))}
        </select>
        <ChevronDown className="ic-chev" aria-hidden />
      </div>

      <div className="select-wrap">
        <select
          className={`filter-select${paymentStatus ? ' active' : ''}`}
          aria-label="Filter by payment status"
          value={paymentStatus}
          onChange={(e) => pushParams({ paymentStatus: e.target.value })}
        >
          <option value="">Payment</option>
          {PAYMENT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="ic-chev" aria-hidden />
      </div>

      {hasActive && (
        <button className="btn-tertiary" type="button" onClick={clearFilters}>
          <X size={14} aria-hidden />
          Clear filters
        </button>
      )}
    </div>
  );
}
