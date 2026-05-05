import * as React from 'react'

import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-primary text-white shadow-soft hover:bg-primary-hover',
  outline: 'border border-line bg-surface text-text hover:bg-primary-soft',
  secondary: 'bg-accent text-white shadow-soft hover:bg-accent-hover',
  ghost: 'text-muted hover:bg-primary-soft hover:text-primary',
  destructive: 'bg-danger text-white hover:bg-[#c93f3f]',
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
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
