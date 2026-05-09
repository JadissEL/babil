import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  appendFullDataChangelog,
  DEFAULT_MAX_FULL_DATA_CHANGELOG_ENTRIES,
  FULL_DATA_CHANGELOG_KEY,
  stripFullDataChangelog,
} from './full-data-changelog'

describe('full-data-changelog', () => {
  it('appendFullDataChangelog prepends and caps', () => {
    let full: Record<string, unknown> = { x: 1 }
    for (let i = 0; i < DEFAULT_MAX_FULL_DATA_CHANGELOG_ENTRIES + 5; i++) {
      full = appendFullDataChangelog(
        full,
        { actor: 'system', action: `t${i}`, detail: String(i) },
        { maxEntries: 3 },
      )
    }
    const log = full[FULL_DATA_CHANGELOG_KEY] as unknown[]
    assert.equal(log.length, 3)
    assert.match(String((log[0] as { action?: string }).action), /^t\d+/)
  })

  it('stripFullDataChangelog removes key', () => {
    const full = appendFullDataChangelog(
      { a: 1 },
      { actor: 'admin', action: 'admin.patch', detail: 'x', subjectId: 'user_1' },
    )
    assert.ok(FULL_DATA_CHANGELOG_KEY in full)
    const stripped = stripFullDataChangelog(full)
    assert.ok(!(FULL_DATA_CHANGELOG_KEY in stripped))
    assert.equal(stripped.a, 1)
  })
})
