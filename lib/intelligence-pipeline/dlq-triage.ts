/**
 * Dead-letter triage: poison vs transient, safe canary redrive eligibility.
 */

import { DEAD_LETTER_PREFIX } from './job-dead-letter';
import { classifyPipelineError, type PipelineErrorClass } from './transient-errors';

export type DeadLetterTriage = {
  isDeadLetter: boolean;
  errorClass: PipelineErrorClass | 'poison';
  canRedrive: boolean;
  previousError: string | null;
};

const POISON_PATTERNS: RegExp[] = [
  /Invalid payloadJson/i,
  /Country id=\d+ not found/i,
  /launch_gate_sample_failed/i,
  /requires payload\.countryId/i,
  /empty_field_path/i,
];

export function parseDeadLetterPreviousError(errorSummary: string | null): string | null {
  if (!errorSummary?.startsWith(DEAD_LETTER_PREFIX)) return errorSummary;
  const prevMatch = /prev=(.+)$/i.exec(errorSummary);
  return prevMatch?.[1]?.trim() ?? null;
}

export function triageDeadLetterJob(errorSummary: string | null): DeadLetterTriage {
  if (!errorSummary?.startsWith(DEAD_LETTER_PREFIX)) {
    return {
      isDeadLetter: false,
      errorClass: 'unknown',
      canRedrive: false,
      previousError: errorSummary,
    };
  }

  const previousError = parseDeadLetterPreviousError(errorSummary);
  if (previousError && POISON_PATTERNS.some((p) => p.test(previousError))) {
    return {
      isDeadLetter: true,
      errorClass: 'poison',
      canRedrive: false,
      previousError,
    };
  }

  const errorClass = classifyPipelineError(previousError);
  const canRedrive = errorClass === 'transient' || errorClass === 'unknown';

  return {
    isDeadLetter: true,
    errorClass,
    canRedrive,
    previousError,
  };
}
