import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'


export type RecordAdminAuditInput = {
  action: string
  resource: string
  detail?: string | null
  metadata?: Prisma.InputJsonValue | null
}

/**
 * Append-only audit row for admin mutations (E.67). Never throws — failures are swallowed
 * so an audit DB issue cannot block legitimate admin work.
 */
export async function recordAdminAudit(adminUserId: string, input: RecordAdminAuditInput): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action: input.action,
        resource: input.resource,
        detail: input.detail ?? null,
        metadata: input.metadata === undefined || input.metadata === null ? undefined : input.metadata,
      },
    })
  } catch {
    /* best-effort */
  }
}
