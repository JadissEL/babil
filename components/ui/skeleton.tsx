import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'


export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="presentation"
      className={cn('animate-pulse rounded-xl bg-line/45', className)}
      {...props}
    />
  )
}
