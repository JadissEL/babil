import * as React from 'react'

import { cn } from '@/lib/utils'

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const tone =
    pct >= 75
      ? 'from-[#22a06b] to-[#5fc690]'
      : pct >= 50
        ? 'from-[#3157d5] to-[#5b7af0]'
        : pct >= 30
          ? 'from-[#f27a4c] to-[#f59b78]'
          : 'from-[#dc4b4b] to-[#f08080]'
  return (
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={pct}
      className={cn('relative h-3.5 w-full overflow-hidden rounded-full border border-[#e5d9c7] bg-[#f3eadb]', className)}
      {...props}
    >
      <div className={cn('h-full bg-gradient-to-r transition-[width] duration-300', tone)} style={{ width: `${pct}%` }} />
    </div>
  )
}
