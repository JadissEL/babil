/**
 * IntelligencePipelineJob.kind registry — specialized agents as job types.
 */

export const INTELLIGENCE_JOB_KINDS = {
  world_bank_materialize: 'world_bank_materialize',
  manifest_fetch: 'manifest_fetch',
  validate_and_materialize: 'validate_and_materialize',
  extract_manifest_batch: 'extract_manifest_batch',
  visa_friction: 'visa_friction',
  education: 'education',
  travel_signals: 'travel_signals',
  news_trends: 'news_trends',
  stubs_only: 'stubs_only',
  source_discovery: 'source_discovery',
  deep_collect: 'deep_collect',
  pdf_extract: 'pdf_extract',
  link_follow: 'link_follow',
  change_detect: 'change_detect',
} as const;

export type IntelligenceJobKind =
  (typeof INTELLIGENCE_JOB_KINDS)[keyof typeof INTELLIGENCE_JOB_KINDS];

export type IntelligenceJobPayload = {
  trigger?: string;
  worldBank?: boolean;
  materializeEconomy?: boolean;
  worldBankLimit?: number;
  stubMultilateralCollectors?: boolean;
  countryIds?: number[];
  countryId?: number;
  manifestBatchSize?: number;
  llmTokenBudget?: number;
  /** Retry attempt counter (worker-managed). */
  attempt?: number;
  /** ISO timestamp — do not run before this instant (backoff). */
  notBefore?: string;
  /** Discovery / deep collect target source. */
  sourceId?: string;
  sourceSlug?: string;
  changeDetectUrl?: string;
};

export function isLlmExtractKind(kind: string): boolean {
  return kind === INTELLIGENCE_JOB_KINDS.extract_manifest_batch;
}
