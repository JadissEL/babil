import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

/**
 * Serves the maintained OpenAPI document (catalogue **D.63**).
 * Source of truth on disk: `docs/openapi/babil-public-api.yaml`.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), 'docs', 'openapi', 'babil-public-api.yaml');
  const body = await readFile(filePath, 'utf8');
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
