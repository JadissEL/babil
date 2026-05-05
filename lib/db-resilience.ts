export function isDbUnavailable(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message || error || '').toLowerCase()
  return (
    msg.includes('unable to open the database file') ||
    msg.includes('error code 14') ||
    msg.includes("can't reach database server") ||
    msg.includes('failed to connect') ||
    msg.includes('connection refused') ||
    msg.includes('timeout')
  )
}
