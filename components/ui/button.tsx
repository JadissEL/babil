import * as React from 'react'

import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-blue-600 text-white shadow-sm hover:bg-blue-500',
  outline: 'border border-white/20 bg-transparent text-slate-100 hover:bg-white/5',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', type = 'button', disabled, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
