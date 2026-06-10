/**
 * Shared LLM provider config — supports OpenAI and OpenRouter (OpenAI-compatible).
 */

export type LlmApiConfig = {
  apiKey: string
  /** Full chat-completions endpoint URL. */
  endpoint: string
  model: string
  /** Extra headers (OpenRouter attribution). */
  headers: Record<string, string>
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const OPENAI_BASE = 'https://api.openai.com/v1'

/** Returns null when no API key is configured. */
export function resolveLlmApiConfig(): LlmApiConfig | null {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim()
  const openAiKey = process.env.OPENAI_API_KEY?.trim()
  const apiKey = openRouterKey || openAiKey
  if (!apiKey) return null

  const isOpenRouter = Boolean(openRouterKey) || apiKey.startsWith('sk-or-')
  const baseUrl =
    process.env.INTELLIGENCE_LLM_BASE_URL?.trim().replace(/\/+$/, '') ||
    (isOpenRouter ? OPENROUTER_BASE : OPENAI_BASE)

  const model =
    process.env.INTELLIGENCE_LLM_MODEL?.trim() ||
    (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini')

  const headers: Record<string, string> = {}
  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'https://github.com/JadissEL/babil'
    headers['X-Title'] = 'Babil Immigration Intelligence'
  }

  return { apiKey, endpoint: `${baseUrl}/chat/completions`, model, headers }
}
