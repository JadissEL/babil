import * as React from 'react'

import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40',
        variant === 'default' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-slate-500/20 text-gray-300',
        className,
      )}
      {...props}
    />
  )
}
