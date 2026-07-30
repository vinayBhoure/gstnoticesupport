import { getErrorCode } from './client';

// Transport failures (offline, backend down, gateway 5xx) are not the user's mistake and
// carry no field context — the auth forms surface these as a toast rather than as an inline
// banner beside the inputs, which would read as a validation failure.
export function isTransportError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === 'NETWORK_ERROR' || code === 'INTERNAL_ERROR';
}
