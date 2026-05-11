import { DockObjectivePicker } from '@/components/objectives/DockObjectivePicker';

/** Bandeau objectif sous le contenu principal, au-dessus du pied de page (pas fixe : pas de conflit avec la barre comparateur). */
export function SiteObjectiveDock() {
  return (
    <section
      className="shrink-0 border-t border-line bg-primary-soft/40 py-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4"
      aria-label="Objectif principal"
    >
      <DockObjectivePicker />
    </section>
  );
}
