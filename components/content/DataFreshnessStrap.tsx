import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DataFreshnessStrap({
  agentUpdatedAt,
  className,
}: {
  agentUpdatedAt?: string | null;
  className?: string;
}) {
  if (typeof agentUpdatedAt !== 'string' || !agentUpdatedAt.trim()) return null;
  let label = agentUpdatedAt;
  try {
    label = new Date(agentUpdatedAt).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    /* keep raw */
  }
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 font-serif text-[10px] font-bold uppercase tracking-[0.18em] text-[#0D1B3E]/55',
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden />
      Dernière passe agent : {label}
    </p>
  );
}
