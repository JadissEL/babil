/**
 * Phase D — second-pass contradiction review (heuristic when budget > 0; LLM hook reserved).
 */

import { applyHeuristicContradictionConflicts } from './apply-heuristic-contradictions';
import { loadContradictionExcerpts } from './contradiction-excerpts';
import { runHeuristicContradictionPass } from './contradiction-heuristic';
import {
  encodeLlmConflictsForApply,
  runOpenAiContradictionReview,
} from './llm-contradiction-provider';
import type { FieldConsensus } from './types';

export type ContradictionReviewResult = {
  fieldPath: string;
  needsHumanReview: boolean;
  reason?: string;
};

/** Medium-confidence fields flagged for admin review without calling an LLM. */
export function reviewContradictionsForAdmin(
  consensus: FieldConsensus[],
): ContradictionReviewResult[] {
  const out: ContradictionReviewResult[] = [];
  for (const c of consensus) {
    if (c.disputed) {
      out.push({ fieldPath: c.fieldPath, needsHumanReview: true, reason: 'disputed_values' });
      continue;
    }
    if (
      c.verificationStatus === 'estimated' &&
      c.confidence >= 0.5 &&
      c.confidence < 0.72 &&
      c.sourcesConfirmed < 2
    ) {
      out.push({
        fieldPath: c.fieldPath,
        needsHumanReview: true,
        reason: 'medium_confidence_single_source',
      });
    }
  }
  return out;
}

/** Bounded second pass: heuristic on excerpts when tokenBudget > 0; LLM provider TBD. */
export async function runLlmContradictionPassIfBudgeted(args: {
  excerpts?: string[];
  tokenBudget: number;
  countryIds?: number[];
}): Promise<{
  conflicts: string[];
  mode: 'skipped' | 'heuristic' | 'llm';
  applied?: { countriesUpdated: number; pathsFlagged: number };
  llmModel?: string;
}> {
  if (args.tokenBudget <= 0) {
    return { conflicts: [], mode: 'skipped' };
  }

  let structured = await loadContradictionExcerpts({
    countryIds: args.countryIds,
    limit: Math.min(64, Math.max(8, Math.floor(args.tokenBudget / 100))),
  });

  if (structured.length === 0 && args.excerpts?.length) {
    structured = args.excerpts.slice(0, 32).map((excerpt, i) => ({
      observationId: `inline:${i}`,
      countryId: 0,
      fieldPath: 'provenance.manifest.unknown',
      excerpt,
      valueNumeric: null,
      confidence: 0.5,
    }));
  }

  const heuristic = runHeuristicContradictionPass(structured);
  let allConflicts = [...heuristic.conflicts];
  let mode: 'heuristic' | 'llm' = 'heuristic';
  let llmModel: string | undefined;

  const llmMinBudget = Math.max(800, Number(process.env.INTELLIGENCE_LLM_MIN_TOKEN_BUDGET || 1200));
  if (args.tokenBudget >= llmMinBudget && process.env.OPENAI_API_KEY?.trim()) {
    const llm = await runOpenAiContradictionReview({
      excerpts: structured,
      tokenBudget: args.tokenBudget,
    });
    if (llm && llm.conflicts.length > 0) {
      const encoded = encodeLlmConflictsForApply(llm.conflicts);
      allConflicts = Array.from(new Set([...allConflicts, ...encoded]));
      mode = 'llm';
      llmModel = llm.model;
    }
  }

  const applied =
    allConflicts.length > 0
      ? await applyHeuristicContradictionConflicts(allConflicts)
      : { countriesUpdated: 0, pathsFlagged: 0 };

  return {
    conflicts: allConflicts,
    mode,
    applied,
    llmModel,
  };
}
