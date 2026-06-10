/**
 * Optional LLM fill for structured fields when rule extractors found nothing.
 */

import { z } from 'zod'

import { resolveLlmApiConfig } from '@/lib/datafile/extract/llm-config'

const FillSchema = z.object({
  fields: z.array(
    z.object({
      fieldPath: z.string().min(3),
      value: z.string().min(2).max(400),
    }),
  ),
})

/** Accept both {fieldPath, value} entries and {"<path>": "<value>"} map entries. */
function coerceFields(parsed: unknown): { fieldPath: string; value: string }[] {
  if (typeof parsed !== 'object' || parsed === null) return []
  const fields = (parsed as { fields?: unknown }).fields
  if (!Array.isArray(fields)) return []

  const out: { fieldPath: string; value: string }[] = []
  for (const entry of fields) {
    if (typeof entry !== 'object' || entry === null) continue
    const rec = entry as Record<string, unknown>
    if (typeof rec.fieldPath === 'string' && typeof rec.value === 'string') {
      out.push({ fieldPath: rec.fieldPath, value: rec.value })
      continue
    }
    for (const [key, value] of Object.entries(rec)) {
      if (typeof value === 'string' && key.length >= 3) {
        out.push({ fieldPath: key, value })
      }
    }
  }
  return out.filter((f) => f.value.trim().length >= 2 && f.value.length <= 400)
}

export type LlmFillInput = {
  countryName: string
  excerpt: string
  candidateFieldPaths: string[]
}

export type LlmFillResult = { fieldPath: string; value: string; confidence: number }[]

export async function llmFillFieldGaps(
  input: LlmFillInput,
  tokenBudget: number,
): Promise<LlmFillResult> {
  const config = resolveLlmApiConfig()
  if (!config || tokenBudget < 800 || input.excerpt.length < 120) return []

  const maxTokens = Math.min(600, Math.max(200, Math.floor(tokenBudget / 4)))

  const prompt = [
    'Extract immigration facts from the excerpt for the given country.',
    'Return JSON only, exactly this shape:',
    '{ "fields": [{ "fieldPath": "<one allowed path>", "value": "<short factual value>" }] }',
    'Example: { "fields": [{ "fieldPath": "visa_processing_time", "value": "15 calendar days" }] }',
    'Only include fields explicitly supported by the excerpt. Empty array if none.',
    `Allowed fieldPath values: ${input.candidateFieldPaths.join(', ')}`,
    `Country: ${input.countryName}`,
    `Excerpt:\n${input.excerpt.slice(0, 3500)}`,
  ].join('\n')

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You extract structured visa and appointment facts. JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    if (process.env.DATAFILE_LLM_DEBUG === '1') {
      console.warn('[llm-fill-gaps] LLM API error', res.status, await res.text().catch(() => ''))
    }
    return []
  }

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  let raw = body.choices?.[0]?.message?.content?.trim()
  if (!raw) return []
  // Some providers wrap JSON in markdown fences despite response_format.
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  try {
    const json = JSON.parse(raw) as unknown
    const strict = FillSchema.safeParse(json)
    const fields = strict.success ? strict.data.fields : coerceFields(json)
    if (fields.length === 0 && process.env.DATAFILE_LLM_DEBUG === '1') {
      console.warn('[llm-fill-gaps] no usable fields:', raw.slice(0, 400))
    }
    const allowed = new Set(input.candidateFieldPaths)
    return fields
      .filter((f) => allowed.has(f.fieldPath))
      .map((f) => ({ fieldPath: f.fieldPath, value: f.value.trim(), confidence: 0.66 }))
  } catch {
    if (process.env.DATAFILE_LLM_DEBUG === '1') {
      console.warn('[llm-fill-gaps] JSON parse failed:', raw.slice(0, 400))
    }
    return []
  }
}
