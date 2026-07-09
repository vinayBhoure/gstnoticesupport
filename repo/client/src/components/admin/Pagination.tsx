import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  // Current query params to preserve across page links (filters, search, sort).
  query: Record<string, string | undefined>;
};

function pageHref(basePath: string, query: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  if (page > 1) search.set('page', String(page));
  else search.delete('page');
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Pagination per resources/ui/Admin Bookings.html → .pagination. Server-rendered
// links (URL-driven paging); numbered buttons collapse to ellipsis beyond 7 pages.
export function Pagination({ page, limit, total, basePath, query }: PaginationProps) {
  const pages = Math.ceil(total / limit);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const info = (
    <span className="page-info">
      Showing {start}–{end} of {total}
    </span>
  );

  if (pages <= 1) {
    return <div className="pagination">{info}</div>;
  }

  const items: (number | 'ellipsis')[] = [];
  for (let p = 1; p <= pages; p++) {
    const show = pages <= 7 || p === 1 || p === pages || Math.abs(p - page) <= 1;
    if (show) items.push(p);
    else if (Math.abs(p - page) === 2) items.push('ellipsis');
  }

  return (
    <div className="pagination">
      {info}
      <div className="page-controls">
        <Link
          className="page-btn"
          aria-label="Previous page"
          aria-disabled={page === 1}
          href={pageHref(basePath, query, Math.max(1, page - 1))}
        >
          <ChevronLeft size={15} aria-hidden />
        </Link>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`e-${index}`} className="page-ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <Link
              key={item}
              className="page-btn"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              href={pageHref(basePath, query, item)}
            >
              {item}
            </Link>
          ),
        )}
        <Link
          className="page-btn"
          aria-label="Next page"
          aria-disabled={page === pages}
          href={pageHref(basePath, query, Math.min(pages, page + 1))}
        >
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
