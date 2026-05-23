'use client';

import { useEffect, useRef, useState } from 'react';
import { useObjectiveChangeFlow } from '@/components/objectives/ObjectiveChangeFlow';
import {
  drawObjectiveTransitionFrame,
  prefersReducedMotion,
} from '@/lib/objective-transition-canvas';
import { objectiveTransitionPhaseLabel } from '@/lib/user-objectives/change-copy';
import { cn } from '@/lib/utils';

export function ObjectiveTransitionOverlay() {
  const { phase, pending, transitionProgress } = useObjectiveChangeFlow();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const visible = phase === 'transitioning' && pending !== null;

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!visible || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !pending || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startRef.current = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      resize();
      drawObjectiveTransitionFrame(ctx, {
        width: canvas.width,
        height: canvas.height,
        progress: transitionProgress,
        fromLabel: pending.copy.fromLabel ?? '',
        toLabel: pending.copy.toLabel,
        timeMs: elapsed,
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, pending, transitionProgress, reducedMotion]);

  if (!visible || !pending) return null;

  const phaseLabel = objectiveTransitionPhaseLabel(transitionProgress);

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-[#fdf8ef] px-6 transition-opacity duration-300"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-lg font-black text-[#0D1B3E]">{pending.copy.toLabel}</p>
        <p className="mt-2 text-sm font-medium text-muted">{phaseLabel}</p>
        <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-[#0D1B3E]/10">
          <div
            className="h-full rounded-full bg-[#0D1B3E] transition-[width] duration-300"
            style={{ width: `${Math.round(transitionProgress * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[250] flex flex-col bg-[#0D1B3E]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Transition vers ${pending.copy.toLabel}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-end pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <p className={cn('text-sm font-black uppercase tracking-widest text-[#0D1B3E]/80')}>{phaseLabel}</p>
      </div>
    </div>
  );
}
