import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  delegatedRequestLogContext,
  maskEmailForAdminList,
  maskPersonNameForAdmin,
  maskPhoneForAdmin,
  redactDelegatedPayloadDeep,
  redactDelegatedPayloadJsonString,
} from './delegated-application-payload-utils'

describe('delegated-application-payload-utils (B.36)', () => {
  it('maskEmailForAdminList keeps domain visible', () => {
    assert.equal(maskEmailForAdminList('jean.dupont@example.com'), 'j***@example.com')
  })

  it('maskPhoneForAdmin keeps last two digits', () => {
    assert.match(maskPhoneForAdmin('+212 6 12 34 56 78'), /^\*\*\*\*78$/)
  })

  it('maskPersonNameForAdmin abbreviates parts', () => {
    assert.equal(maskPersonNameForAdmin('Jean Dupont'), 'J*** D***')
  })

  it('delegatedRequestLogContext has no raw payload', () => {
    const c = delegatedRequestLogContext({ id: 1, category: 'job', packageId: 'x', userId: 'u' })
    assert.equal(Object.keys(c).includes('payload'), false)
  })

  it('redactDelegatedPayloadDeep preserves packageSnapshot product name', () => {
    const raw = {
      packageSnapshot: { id: 'p1', name: 'Pack Pro', priceMad: 1000, tierLabel: 'Pro' },
      contact: { fullName: 'Jean Dupont', email: 'j@ex.com', phone: '+212600000000' },
    }
    const out = redactDelegatedPayloadDeep(raw) as Record<string, unknown>
    const snap = out.packageSnapshot as Record<string, unknown>
    assert.equal(snap.name, 'Pack Pro')
    const c = out.contact as Record<string, unknown>
    assert.match(String(c.email), /\*\*\*@ex\.com/)
    assert.notEqual(String(c.fullName), 'Jean Dupont')
  })

  it('redactDelegatedPayloadJsonString returns valid JSON', () => {
    const s = redactDelegatedPayloadJsonString(
      JSON.stringify({ contact: { email: 'a@b.co', phone: '0612345678' } }),
    )
    const p = JSON.parse(s) as { contact: { email: string; phone: string } }
    assert.ok(p.contact.email.includes('***'))
  })
})
