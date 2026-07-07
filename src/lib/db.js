// Logs Supabase query errors with context and returns data (or null on error).
export function unwrap({ data, error }, context) {
  if (error) {
    console.error(`[${context}]`, error)
    return null
  }
  return data
}
