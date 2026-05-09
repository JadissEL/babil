export type ToastVariant = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  variant: ToastVariant
  message: string
}

let toasts: ToastItem[] = []
let idSeq = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function subscribeToasts(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

export function getToastSnapshot(): ToastItem[] {
  return toasts
}

export function getServerToastSnapshot(): ToastItem[] {
  return []
}

export function dismissToast(id: number) {
  if (!toasts.some((t) => t.id === id)) return
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function pushToast(variant: ToastVariant, message: string, durationMs = 4800) {
  if (typeof window === 'undefined') return
  const id = ++idSeq
  toasts = [...toasts, { id, variant, message }]
  emit()
  window.setTimeout(() => dismissToast(id), durationMs)
}

export const appToast = {
  success: (message: string) => pushToast('success', message),
  error: (message: string) => pushToast('error', message),
  info: (message: string) => pushToast('info', message),
}
