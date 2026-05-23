import type { ObservationVerificationStatus } from '@prisma/client';

export type ObservationValue = {
  value?: number | string | boolean;
  [key: string]: unknown;
};

export type FieldConsensus = {
  fieldPath: string;
  countryId: number;
  verificationStatus: ObservationVerificationStatus;
  sourcesConfirmed: number;
  confidence: number;
  winningValueJson: string | null;
  disputed: boolean;
  observationIds: string[];
};

export const PROMOTION_CONFIDENCE_MIN = Number(
  process.env.INTELLIGENCE_PROMOTION_CONFIDENCE_MIN || 0.65,
);

export const PROMOTION_SOURCES_MIN = Number(process.env.INTELLIGENCE_PROMOTION_SOURCES_MIN || 1);

export const CONTRADICTION_RELATIVE_DELTA = Number(
  process.env.INTELLIGENCE_CONTRADICTION_REL_DELTA || 0.15,
);
