const hostLastFetch = new Map<string, number>()

export function delayMsBetweenHosts(): number {
  return Math.max(500, Number(process.env.DATAFILE_SCRAPE_DELAY_MS || 1500))
}

export async function waitForHost(hostname: string): Promise<void> {
  const delay = delayMsBetweenHosts()
  const last = hostLastFetch.get(hostname) ?? 0
  const wait = last + delay - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  hostLastFetch.set(hostname, Date.now())
}
