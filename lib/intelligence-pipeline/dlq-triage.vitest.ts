import { describe, expect, it } from 'vitest';
import { DEAD_LETTER_PREFIX } from './job-dead-letter';
import { triageDeadLetterJob } from './dlq-triage';

describe('triageDeadLetterJob', () => {
  it('flags poison messages as non-redrivable', () => {
    const t = triageDeadLetterJob(
      `${DEAD_LETTER_PREFIX}attempts=3;kind=manifest_fetch;prev=Invalid payloadJson`,
    );
    expect(t.errorClass).toBe('poison');
    expect(t.canRedrive).toBe(false);
  });

  it('allows redrive for transient previous errors', () => {
    const t = triageDeadLetterJob(
      `${DEAD_LETTER_PREFIX}attempts=3;kind=manifest_fetch;prev=fetch failed: timeout`,
    );
    expect(t.canRedrive).toBe(true);
  });
});
