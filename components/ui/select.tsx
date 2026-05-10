'use client'

import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

type SelectCtx = {
  value: string
  setValue: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
  labelByValue: Record<string, string>
  registerItem: (value: string, label: string) => void
}

const SelectContext = React.createContext<SelectCtx | null>(null)

function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('Select parts must be used within <Select />')
  return ctx
}

export function Select({
  children,
  value,
  defaultValue,
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? (value ?? '') : uncontrolledValue

  const [open, setOpen] = React.useState(false)
  const [labelByValue, setLabelByValue] = React.useState<Record<string, string>>({})
  const rootRef = React.useRef<HTMLDivElement>(null)

  const registerItem = React.useCallback((v: string, label: string) => {
    setLabelByValue((prev) => (prev[v] === label ? prev : { ...prev, [v]: label }))
  }, [])

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next)
      onValueChange?.(next)
      setOpen(false)
    },
    [isControlled, onValueChange],
  )

  const api = React.useMemo<SelectCtx>(
    () => ({
      value: currentValue,
      setValue,
      open,
      setOpen,
      labelByValue,
      registerItem,
    }),
    [currentValue, labelByValue, open, registerItem, setValue],
  )

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <SelectContext.Provider value={api}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & {
  className?: string
  children?: React.ReactNode
}) {
  const ctx = useSelect()
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      className={cn(
        'flex h-10 items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-left text-sm text-text transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className,
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronDown className="size-4 shrink-0 text-muted opacity-70" aria-hidden />
    </button>
  )
}

export function SelectValue({
  placeholder,
}: {
  placeholder?: React.ReactNode
}) {
  const ctx = useSelect()
  const v = ctx.value
  const labelled = ctx.labelByValue[v]
  const display = labelled ?? (typeof v === 'string' ? v : String(v ?? ''))
  return <span className="truncate">{display !== '' ? display : placeholder || ''}</span>
}

export function SelectContent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const ctx = useSelect()
  if (!ctx.open) return null

  return (
    <div
      role="listbox"
      className={cn(
        'absolute z-50 mt-1 max-h-[min(18rem,var(--radix-select-content-available-height,18rem))] min-w-[100%] overflow-auto rounded-xl border border-line bg-surface p-1 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  value,
  children,
}: {
  value: string
  children?: React.ReactNode
}) {
  const ctx = useSelect()
  const rawLabel = typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : value

  React.useEffect(() => {
    ctx.registerItem(value, rawLabel)
  }, [ctx, rawLabel, value])

  const label = typeof children === 'undefined' ? value : rawLabel

  return (
    <button
      type="button"
      role="option"
      aria-selected={ctx.value === value}
      className={cn(
        'relative flex w-full cursor-pointer select-none rounded-lg px-2.5 py-1.5 text-left text-sm text-text outline-none hover:bg-primary-soft data-[highlighted=true]:bg-primary-soft',
        ctx.value === value && 'bg-primary-soft text-primary',
      )}
      data-highlighted={ctx.value === value}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => ctx.setValue(value)}
    >
      {children ?? label}
    </button>
  )
}
