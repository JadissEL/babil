'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import { DockObjectivePicker } from '@/components/objectives/DockObjectivePicker';
import { cn } from '@/lib/utils';
import { VF_OBJECTIVE_DOCK_HEIGHT_VAR } from '@/lib/vf-layout-css';

const CSS_VAR = VF_OBJECTIVE_DOCK_HEIGHT_VAR;

/**
 * Sélecteur d’objectif **compact**, fixé **sous l’en-tête** près du coin lecture (aligné contenu),
 * pour ne plus recouvrir le pied de page. La hauteur mesurée reste publiée dans
 * `{@link VF_OBJECTIVE_DOCK_HEIGHT_VAR}` (toasts, specs QA, etc.).
 */
export function SiteObjectiveDock() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const isMeridianHome = pathname === '/';

  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty(CSS_VAR, `${Math.max(h, 32)}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty(CSS_VAR);
    };
  }, []);

  return (
    <section
      ref={ref}
      className={cn(
        'fixed z-30 w-[min(17.5rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-[#fdf8ef]/95 py-1.5 pl-2 pr-2 shadow-[0_8px_24px_rgba(20,26,36,0.1)] backdrop-blur-md top-[calc(env(safe-area-inset-top,0px)+6.5rem)]',
        isMeridianHome
          ? 'left-[max(1rem,calc((100vw-min(100vw,72rem))/2+0.75rem))]'
          : 'left-[max(0.75rem,env(safe-area-inset-left,0px))] lg:left-[calc(14rem+1rem)]',
      )}
      aria-label="Objectif principal"
    >
      <DockObjectivePicker variant="compact" />
    </section>
  );
}
