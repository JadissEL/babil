export type LlmBudgetResolution = {
  budget: number
  enabled: boolean
  skipReason?: string
}

/** Resolve token budget when --llm-fill is requested. */
export function resolveLlmBudget(opts: {
  llmFill: boolean
  explicitBudget?: number
}): LlmBudgetResolution {
  if (!opts.llmFill) {
    return { budget: 0, enabled: false, skipReason: 'llm_fill_not_requested' }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return { budget: 0, enabled: false, skipReason: 'missing_openai_api_key' }
  }

  let budget =
    opts.explicitBudget ??
    (Number(process.env.AGENT_LLM_TOKEN_BUDGET_PER_TASK || 0) ||
      Number(process.env.DATAFILE_LLM_TOKEN_BUDGET || 0))

  if (!Number.isFinite(budget) || budget < 800) {
    budget = 4000
  }

  return { budget, enabled: true }
}
