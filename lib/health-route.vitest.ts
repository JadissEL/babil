import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET as getHealth } from '@/app/api/health/route';

const queryRaw = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    queryRaw.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when database responds', async () => {
    queryRaw.mockResolvedValueOnce([1]);
    const res = await getHealth();
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.checks).toEqual({ database: 'up' });
    expect(typeof body.engineVersion).toBe('string');
  });

  it('returns 503 with database down when error looks like unavailable', async () => {
    queryRaw.mockRejectedValueOnce(new Error("Can't reach database server"));
    const res = await getHealth();
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(false);
    expect(body.checks).toEqual({ database: 'down' });
  });

  it('returns 503 with database error for unexpected failures', async () => {
    queryRaw.mockRejectedValueOnce(new Error('unexpected prisma failure'));
    const res = await getHealth();
    expect(res.status).toBe(503);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(false);
    expect(body.checks).toEqual({ database: 'error' });
  });
});
