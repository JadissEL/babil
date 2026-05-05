import * as React from 'react'

import { cn } from '@/lib/utils'

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={pct}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/15', className)}
      {...props}
    >
      <div className="h-full bg-blue-600 transition-[width] duration-200" style={{ width: `${pct}%` }} />
    </div>
  )
}
