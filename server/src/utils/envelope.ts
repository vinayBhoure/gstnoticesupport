export function envelope<T>(data: T, statusCode = 200) {
  return { success: true, data, error: null, statusCode };
}
