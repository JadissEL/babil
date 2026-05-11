'use client';

import { useLayoutEffect, useRef } from 'react';
import { DockObjectivePicker } from '@/components/objectives/DockObjectivePicker';

const CSS_VAR = '--vf-objective-dock-height';

/** Bandeau objectif fixe en bas d’écran ; la hauteur est publiée en `{@link CSS_VAR}` pour le padding du `main` et la barre comparateur. */
export function SiteObjectiveDock() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty(CSS_VAR, `${Math.max(h, 48)}px`);
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
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-[#fdf8ef]/95 py-3 shadow-[0_-8px_24px_rgba(20,26,36,0.08)] backdrop-blur-md pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] pt-3 lg:left-56"
      aria-label="Objectif principal"
    >
      <DockObjectivePicker />
    </section>
  );
}
