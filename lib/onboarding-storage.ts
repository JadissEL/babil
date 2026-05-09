const KEY = 'vf_onboarding_v1'

export type OnboardingStorage = {
  dismissed?: boolean
  explorerDone?: boolean
  recoSeen?: boolean
}

export function readOnboarding(): OnboardingStorage {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const o = JSON.parse(raw) as unknown
    return typeof o === 'object' && o !== null ? (o as OnboardingStorage) : {}
  } catch {
    return {}
  }
}

export function writeOnboarding(patch: Partial<OnboardingStorage>) {
  if (typeof window === 'undefined') return
  try {
    const next = { ...readOnboarding(), ...patch }
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

/** Explorer checklist: call after a deliberate action, not a passive page view. */
export function markExplorerOnboardingEngaged() {
  writeOnboarding({ explorerDone: true })
}
