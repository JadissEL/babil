import { NextResponse } from 'next/server'
import { ifNoneMatchReturns304, weakEtagFromUtf8 } from '@/lib/http-weak-etag'

export function jsonWithCacheAndWeakEtag(
  req: Request,
  body: unknown,
  cacheControl: string,
): NextResponse {
  const json = JSON.stringify(body)
  const etag = weakEtagFromUtf8(json)
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheControl,
    ETag: etag,
  }
  if (ifNoneMatchReturns304(req, etag)) {
    return new NextResponse(null, { status: 304, headers: baseHeaders })
  }
  return new NextResponse(json, { status: 200, headers: baseHeaders })
}
