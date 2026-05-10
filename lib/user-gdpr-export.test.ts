import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildGdprExportBundle, GDPR_EXPORT_SCHEMA_VERSION } from './user-gdpr-export'

describe('user-gdpr-export (B.37)', () => {
  it('buildGdprExportBundle shapes ISO dates and parses JSON payloads', () => {
    const at = new Date('2026-01-15T12:00:00.000Z')
    const b = buildGdprExportBundle({
      exportedAt: at,
      historyEventsMaxRows: 500,
      user: {
        id: 'u1',
        email: 'a@b.co',
        name: 'Test',
        role: 'USER',
        createdAt: at,
      },
      profile: { userId: 'u1', age: 30 } as Record<string, unknown>,
      comments: [],
      favorites: [],
      historyEvents: [
        {
          id: 1,
          type: 'VIEW_COUNTRY',
          payload: JSON.stringify({ countryId: 3 }),
          createdAt: at,
        },
      ],
      delegatedRequests: [
        {
          id: 9,
          category: 'job',
          packageId: 'p1',
          status: 'SUBMITTED',
          payload: '{"contact":{"email":"x@y.co"}}',
          createdAt: at,
        },
      ],
    })
    assert.equal(b._export.schemaVersion, GDPR_EXPORT_SCHEMA_VERSION)
    assert.equal(b.user?.email, 'a@b.co')
    const hist = b.historyEvents[0] as { payload: { countryId: number } }
    assert.equal(hist.payload.countryId, 3)
    const del = b.delegatedApplicationRequests[0] as { payload: { contact: { email: string } } }
    assert.equal(del.payload.contact.email, 'x@y.co')
  })

  it('handles invalid JSON payloads gracefully', () => {
    const at = new Date()
    const b = buildGdprExportBundle({
      exportedAt: at,
      historyEventsMaxRows: 500,
      user: null,
      profile: null,
      comments: [],
      favorites: [],
      historyEvents: [{ id: 1, type: 'T', payload: '{', createdAt: at }],
      delegatedRequests: [],
    })
    const p = b.historyEvents[0]?.payload as Record<string, unknown>
    assert.equal(p._parseError, true)
  })
})
