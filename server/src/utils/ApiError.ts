export type ApiErrorDetail = { field: string; message: string };

// Machine-readable payload a client needs to act on the failure — e.g. the userId the
// login form must carry into /verify-otp. Never put PII or secrets here; it is serialized
// straight into the error response body (RULES.md §4.1).
export type ApiErrorMeta = Record<string, string | number | boolean>;

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorDetail[],
    public readonly meta?: ApiErrorMeta,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
