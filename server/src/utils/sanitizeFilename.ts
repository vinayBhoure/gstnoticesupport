// Strips everything that would break an S3 key: spaces, non-ASCII, and any
// character outside [A-Za-z0-9._-] (backend.md §9.3). The result is only the
// stem used inside the generated key — the original filename is stored
// separately on the BookingDocument row for display.
export function sanitizeFilename(filename: string): string {
  const stem = filename.replace(/\.[^.]*$/, '');
  const cleaned = stem
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : 'document';
}
