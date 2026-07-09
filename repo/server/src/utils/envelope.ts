export function envelope<T>(data: T, message?: string) {
  return { success: true as const, ...(message ? { message } : {}), data };
}

export function paginated<T>(
  data: T[],
  meta: { page: number; limit: number; total: number },
) {
  return { success: true as const, data, meta };
}
