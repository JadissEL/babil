import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  capObservationRawPayloadJson,
  OBSERVATION_RAW_PAYLOAD_MAX_BYTES,
} from './observation-raw-payload';

describe('observation-raw-payload (C.50)', () => {
  it('returns null for empty input', () => {
    assert.equal(capObservationRawPayloadJson(null), null);
    assert.equal(capObservationRawPayloadJson(undefined), null);
    assert.equal(capObservationRawPayloadJson(''), null);
  });

  it('passes through small JSON unchanged', () => {
    const j = JSON.stringify({ wb: { value: 1, date: '2020' } });
    assert.equal(capObservationRawPayloadJson(j), j);
  });

  it('replaces oversized payload with truncation marker', () => {
    const big = 'x'.repeat(OBSERVATION_RAW_PAYLOAD_MAX_BYTES + 500);
    const out = capObservationRawPayloadJson(JSON.stringify({ raw: big }));
    assert.ok(out);
    const parsed = JSON.parse(out!) as { _truncated?: boolean; originalBytes?: number };
    assert.equal(parsed._truncated, true);
    assert.ok(typeof parsed.originalBytes === 'number');
    assert.ok(parsed.originalBytes! > OBSERVATION_RAW_PAYLOAD_MAX_BYTES);
    assert.ok(new TextEncoder().encode(out!).length <= OBSERVATION_RAW_PAYLOAD_MAX_BYTES + 500);
  });
});
