/**
 * Optional OpenAI structured contradiction review (production JSON schema + Zod validation).
 */

import { z } from 'zod';
import type { ContradictionExcerpt } from './contradiction-excerpts';

const LlmConflictSchema = z.object({
  countryId: z.number().int().positive(),
  fieldPath: z.string().min(3),
  reason: z.string().min(8).max(500),
});

const LlmResponseSchema = z.object({
  conflicts: z.array(LlmConflictSchema).max(24),
});

export type LlmContradictionConflict = z.infer<typeof LlmConflictSchema>;

function buildPrompt(excerpts: ContradictionExcerpt[]): string {
  const payload = excerpts.map((e) => ({
    observationId: e.observationId,
    countryId: e.countryId,
    fieldPath: e.fieldPath,
    confidence: e.confidence,
    excerpt: e.excerpt.slice(0, 1200),
    valueNumeric: e.valueNumeric,
  }));
  return [
    'You are a data-quality auditor for a country intelligence pipeline.',
    'Identify field paths where excerpts imply contradictory numeric facts or incompatible claims.',
    'Return JSON only: { "conflicts": [{ "countryId", "fieldPath", "reason" }] }',
    'If no conflicts, return { "conflicts": [] }.',
    `Excerpts JSON:\n${JSON.stringify(payload)}`,
  ].join('\n');
}

function parseLlmJsonContent(raw: string): z.infer<typeof LlmResponseSchema> | null {
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as unknown;
    const result = LlmResponseSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Call OpenAI Chat Completions when OPENAI_API_KEY is set. */
export async function runOpenAiContradictionReview(args: {
  excerpts: ContradictionExcerpt[];
  tokenBudget: number;
}): Promise<{ conflicts: LlmContradictionConflict[]; model: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || args.excerpts.length === 0) return null;

  const model = process.env.INTELLIGENCE_LLM_MODEL?.trim() || 'gpt-4o-mini';
  const maxTokens = Math.min(1200, Math.max(256, Math.floor(args.tokenBudget / 2)));

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Respond with valid JSON only.' },
        { role: 'user', content: buildPrompt(args.excerpts) },
      ],
    }),
  });

  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = parseLlmJsonContent(content);
  if (!parsed) return null;

  return { conflicts: parsed.conflicts, model };
}

/** Encode LLM conflicts in the same format as heuristic pass for applyHeuristicContradictionConflicts. */
export function encodeLlmConflictsForApply(conflicts: LlmContradictionConflict[]): string[] {
  return conflicts.map((c) => `llm:${c.countryId}:${c.fieldPath}:reason=${c.reason.slice(0, 120)}`);
}
