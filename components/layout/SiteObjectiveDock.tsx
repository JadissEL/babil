'use client';

import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { DockObjectivePicker } from '@/components/objectives/DockObjectivePicker';
import { cn } from '@/lib/utils';
import { VF_OBJECTIVE_DOCK_HEIGHT_VAR } from '@/lib/vf-layout-css';

const CSS_VAR = VF_OBJECTIVE_DOCK_HEIGHT_VAR;

function usePublishObjectiveDockHeight(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty(CSS_VAR, `${Math.max(h, 28)}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty(CSS_VAR);
    };
  }, []);
}

type ObjectiveDockInlineProps = {
  className?: string;
};

/**
 * Sélecteur d’objectif **inline** dans la barre d’en-tête (près du logo) : pilule compacte,
 * sans barre fixe plein écran — ne recouvre plus le pied de page.
 */
export function ObjectiveDockInline({ className }: ObjectiveDockInlineProps) {
  const ref = useRef<HTMLElement>(null);
  usePublishObjectiveDockHeight(ref);

  return (
    <section
      ref={ref}
      aria-label="Objectif principal"
      className={cn(
        'shrink-0 rounded-xl border border-line bg-[#fdf8ef]/95 py-1 pl-1.5 pr-1.5 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <DockObjectivePicker variant="compactHeader" />
    </section>
  );
}

/** @deprecated Utiliser {@link ObjectiveDockInline}. */
export const SiteObjectiveDock = ObjectiveDockInline;
