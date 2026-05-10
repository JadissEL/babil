import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
        variant === 'default' && 'border-primary bg-primary text-white',
        variant === 'secondary' && 'border-line bg-[#f8f2e8] text-text',
        variant === 'success' && 'border-[#94dfbd] bg-[#e9f9f1] text-success',
        variant === 'warning' && 'border-[#f2c27a] bg-[#fff5e7] text-warning',
        variant === 'danger' && 'border-[#f3afaf] bg-[#fff0f0] text-danger',
        className,
      )}
      {...props}
    />
  )
}
