import { Skeleton } from '@/components/ui/skeleton'

/** Chargement type dashboard : titres + cartes + bloc principal (accessibilité : `aria-busy`). */
export function DashboardPageSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'profile' | 'table'
}) {
  if (variant === 'profile') {
    return (
      <div
        className="mx-auto max-w-4xl space-y-8 pb-8"
        aria-busy="true"
        aria-label="Chargement du profil"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-9 w-48 sm:h-10 sm:w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="mx-auto max-w-6xl space-y-4" aria-busy="true" aria-label="Chargement du tableau">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8" aria-busy="true" aria-label="Chargement du contenu">
      <div className="space-y-3">
        <Skeleton className="h-9 w-48 sm:h-10 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl sm:h-48" />
        <Skeleton className="h-40 rounded-2xl sm:h-48" />
        <Skeleton className="h-40 rounded-2xl sm:h-48" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}
