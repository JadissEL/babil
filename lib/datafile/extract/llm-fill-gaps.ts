/**
 * Optional LLM fill for structured fields when rule extractors found nothing.
 */

import { z } from 'zod'

const FillSchema = z.object({
  fields: z.array(
    z.object({
      fieldPath: z.string().min(3),
      value: z.string().min(2).max(400),
    }),
  ),
})

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
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey || tokenBudget < 800 || input.excerpt.length < 120) return []

  const model = process.env.INTELLIGENCE_LLM_MODEL?.trim() || 'gpt-4o-mini'
  const maxTokens = Math.min(600, Math.max(200, Math.floor(tokenBudget / 4)))

  const prompt = [
    'Extract immigration facts from the excerpt for the given country.',
    'Return JSON only: { "fields": [{ "fieldPath", "value" }] }',
    `Allowed fieldPath values: ${input.candidateFieldPaths.join(', ')}`,
    `Country: ${input.countryName}`,
    `Excerpt:\n${input.excerpt.slice(0, 3500)}`,
  ].join('\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You extract structured visa and appointment facts. JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) return []

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const raw = body.choices?.[0]?.message?.content?.trim()
  if (!raw) return []

  try {
    const parsed = FillSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return []
    const allowed = new Set(input.candidateFieldPaths)
    return parsed.data.fields
      .filter((f) => allowed.has(f.fieldPath))
      .map((f) => ({ fieldPath: f.fieldPath, value: f.value.trim(), confidence: 0.62 }))
  } catch {
    return []
  }
}
