import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'
import {
  DELEGATED_APPLICATION_PAYLOAD_SCHEMA_VERSION,
  type DelegatedCategory,
  findDelegatedPackage,
} from '@/lib/delegated-application-catalog'
import { previewDelegatedPayload } from '@/lib/delegated-application-payload-utils'
import { isDbUnavailable } from '@/lib/db-resilience'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await prisma.delegatedApplicationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const items = rows.map((r) => {
      const pv = previewDelegatedPayload(r.payload)
      return {
        id: r.id,
        category: r.category,
        packageId: r.packageId,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        packageName: pv.packageName,
        priceMad: pv.priceMad,
      }
    })
    return NextResponse.json({ items })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) return NextResponse.json({ items: [], degraded: true })
    const message = error instanceof Error ? error.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function trimStr(v: unknown, max = 8000): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return t.slice(0, max)
}

function parseCategory(v: unknown): DelegatedCategory | null {
  if (v === 'job' || v === 'university') return v
  return null
}

export async function POST(req: Request) {
  const { userId } = auth()
  const userClerk = await currentUser()

  if (!userId || !userClerk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const category = parseCategory(body.category)
  const packageId = typeof body.packageId === 'string' ? body.packageId.trim() : ''
  if (!category || !packageId) {
    return NextResponse.json({ error: 'category and packageId are required' }, { status: 400 })
  }

  const pkg = findDelegatedPackage(category, packageId)
  if (!pkg) {
    return NextResponse.json({ error: 'Unknown package' }, { status: 400 })
  }

  const contact = body.contact && typeof body.contact === 'object' ? (body.contact as Record<string, unknown>) : {}
  const fullName = trimStr(contact.fullName, 200)
  const email = trimStr(contact.email, 320)
  const phone = trimStr(contact.phone, 64)
  const preferredLanguage = trimStr(contact.preferredLanguage, 16) ?? 'fr'

  if (!fullName || !email || !phone) {
    return NextResponse.json(
      { error: 'contact.fullName, contact.email and contact.phone are required' },
      { status: 400 },
    )
  }

  const jobBlock = body.job && typeof body.job === 'object' ? (body.job as Record<string, unknown>) : {}
  const uniBlock = body.university && typeof body.university === 'object' ? (body.university as Record<string, unknown>) : {}

  const jobFields =
    category === 'job'
      ? {
          targetRoles: trimStr(jobBlock.targetRoles) ?? '',
          targetCountries: trimStr(jobBlock.targetCountries) ?? '',
          experienceSummary: trimStr(jobBlock.experienceSummary) ?? '',
          cvNotes: trimStr(jobBlock.cvNotes) ?? '',
          motivationAngles: trimStr(jobBlock.motivationAngles) ?? '',
          linkedInUrl: trimStr(jobBlock.linkedInUrl, 500) ?? '',
          urgency: trimStr(jobBlock.urgency, 500) ?? '',
          additionalNotes: trimStr(jobBlock.additionalNotes) ?? '',
        }
      : undefined

  const universityFields =
    category === 'university'
      ? {
          programLevel: trimStr(uniBlock.programLevel) ?? '',
          fieldOfStudy: trimStr(uniBlock.fieldOfStudy) ?? '',
          targetCountries: trimStr(uniBlock.targetCountries) ?? '',
          institutionsWishlist: trimStr(uniBlock.institutionsWishlist) ?? '',
          academicsSummary: trimStr(uniBlock.academicsSummary) ?? '',
          languageScores: trimStr(uniBlock.languageScores) ?? '',
          motivationThemes: trimStr(uniBlock.motivationThemes) ?? '',
          documentsReady: trimStr(uniBlock.documentsReady) ?? '',
          additionalNotes: trimStr(uniBlock.additionalNotes) ?? '',
        }
      : undefined

  if (category === 'job') {
    const ok = jobFields && jobFields.targetRoles && jobFields.targetCountries && jobFields.experienceSummary
    if (!ok) {
      return NextResponse.json(
        { error: 'job.targetRoles, job.targetCountries and job.experienceSummary are required' },
        { status: 400 },
      )
    }
  }

  if (category === 'university') {
    const ok =
      universityFields &&
      universityFields.programLevel &&
      universityFields.fieldOfStudy &&
      universityFields.targetCountries
    if (!ok) {
      return NextResponse.json(
        {
          error:
            'university.programLevel, university.fieldOfStudy and university.targetCountries are required',
        },
        { status: 400 },
      )
    }
  }

  const emailDb = userClerk.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`
  const displayName = `${userClerk.firstName ?? ''} ${userClerk.lastName ?? ''}`.trim() || null

  const payload = {
    _schemaVersion: DELEGATED_APPLICATION_PAYLOAD_SCHEMA_VERSION,
    category,
    packageId,
    packageSnapshot: {
      id: pkg.id,
      name: pkg.name,
      priceMad: pkg.priceMad,
      tierLabel: pkg.tierLabel,
    },
    contact: {
      fullName,
      email,
      phone,
      preferredLanguage,
    },
    ...(jobFields ? { job: jobFields } : {}),
    ...(universityFields ? { university: universityFields } : {}),
    guaranteeAcknowledged: Boolean(body.guaranteeAcknowledged),
    submittedAt: new Date().toISOString(),
  }

  if (!payload.guaranteeAcknowledged) {
    return NextResponse.json({ error: 'guaranteeAcknowledged must be true' }, { status: 400 })
  }

  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: emailDb, name: displayName },
      create: { id: userId, email: emailDb, name: displayName },
    })

    const row = await prisma.delegatedApplicationRequest.create({
      data: {
        userId,
        category,
        packageId,
        payload: JSON.stringify(payload),
        status: 'SUBMITTED',
      },
    })

    try {
      await prisma.userHistoryEvent.create({
        data: {
          userId,
          type: 'DELEGATED_APPLICATION_SUBMIT',
          payload: JSON.stringify({ category, packageId, requestId: row.id }),
        },
      })
    } catch {
      /* best-effort audit log */
    }

    return NextResponse.json({ ok: true, id: row.id })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : 'Create failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
