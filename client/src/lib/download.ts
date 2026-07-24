// Navigates a hidden anchor to a URL whose response carries
// Content-Disposition: attachment — triggers a direct download instead of
// opening a new tab. The `download` attribute is ignored for cross-origin
// URLs (e.g. S3), so the server's Content-Disposition header must do the work.
export function triggerFileDownload(url: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
