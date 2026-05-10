import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithAgentRetry } from '@/lib/agent-http-retry';

describe('fetchWithAgentRetry', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.AGENT_HTTP_MAX_ATTEMPTS = '3';
    process.env.AGENT_HTTP_RETRY_BASE_MS = '10';
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    delete process.env.AGENT_HTTP_MAX_ATTEMPTS;
    delete process.env.AGENT_HTTP_RETRY_BASE_MS;
  });

  it('retries on 503 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const p = fetchWithAgentRetry('https://example.com/wb');
    await vi.runAllTimersAsync();
    const res = await p;
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const res = await fetchWithAgentRetry('https://example.com/missing');
    expect(res.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
