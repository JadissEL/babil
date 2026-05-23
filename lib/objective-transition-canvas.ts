/**
 * Canvas frame renderer for primary-objective change transitions (VisaFlow prism palette).
 */

import { PRISM_CREAM, PRISM_NAVY } from '@/lib/compare-prism-ui';

export type ObjectiveTransitionCanvasParams = {
  width: number;
  height: number;
  progress: number;
  fromLabel: string;
  toLabel: string;
  timeMs: number;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function drawObjectiveTransitionFrame(
  ctx: CanvasRenderingContext2D,
  params: ObjectiveTransitionCanvasParams,
): void {
  const { width, height, progress, fromLabel, toLabel, timeMs } = params;
  const t = easeInOutCubic(Math.min(1, Math.max(0, progress)));
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = width / dpr;
  const h = height / dpr;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  const navy = PRISM_NAVY;
  const cream = PRISM_CREAM;
  bg.addColorStop(0, navy);
  bg.addColorStop(lerp(0.15, 0.85, t), `rgba(13, 27, 62, ${lerp(1, 0.25, t)})`);
  bg.addColorStop(1, cream);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.42;
  const ringCount = 6;
  const baseR = Math.min(w, h) * 0.22;

  for (let i = 0; i < ringCount; i++) {
    const phase = (timeMs / 1000) * (0.4 + i * 0.08) + i * 0.9;
    const pulse = 0.92 + 0.08 * Math.sin(phase);
    const r = baseR * (0.55 + i * 0.12) * pulse * (0.85 + t * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 239, 217, ${lerp(0.08, 0.35, t) * (1 - i / ringCount)})`;
    ctx.lineWidth = 1.2 + i * 0.15;
    ctx.stroke();
  }

  const particleN = 48;
  for (let p = 0; p < particleN; p++) {
    const angle = (p / particleN) * Math.PI * 2 + (timeMs / 1200) * 0.5;
    const dist = baseR * (0.4 + (p % 7) * 0.08) * (1 + t * 0.35);
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * 0.65;
    const alpha = lerp(0.15, 0.55, t) * (0.4 + 0.6 * Math.sin(angle + timeMs / 800));
    ctx.beginPath();
    ctx.arc(px, py, 1.2 + (p % 3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 239, 217, ${alpha})`;
    ctx.fill();
  }

  const morph = easeInOutCubic(Math.min(1, Math.max(0, (progress - 0.12) / 0.76)));
  const fromAlpha = 1 - morph;
  const toAlpha = morph;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (fromAlpha > 0.02 && fromLabel) {
    ctx.font = `900 ${Math.round(lerp(22, 18, morph))}px system-ui, sans-serif`;
    ctx.fillStyle = `rgba(253, 248, 239, ${fromAlpha * lerp(0.95, 0, morph)})`;
    ctx.fillText(fromLabel, cx, cy - lerp(0, 14, morph));
  }

  ctx.font = `900 ${Math.round(lerp(20, 28, morph))}px system-ui, sans-serif`;
  ctx.fillStyle = `rgba(13, 27, 62, ${lerp(0.4, 1, toAlpha)})`;
  ctx.fillText(toLabel, cx, cy + lerp(14, 0, morph));

  const barW = Math.min(280, w * 0.55);
  const barH = 4;
  const barX = cx - barW / 2;
  const barY = h * 0.72;
  const roundBar = (x: number, y: number, bw: number, bh: number) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 2);
    } else {
      ctx.beginPath();
      ctx.rect(x, y, bw, bh);
    }
  };

  ctx.fillStyle = 'rgba(13, 27, 62, 0.12)';
  roundBar(barX, barY, barW, barH);
  ctx.fill();
  ctx.fillStyle = PRISM_NAVY;
  roundBar(barX, barY, barW * progress, barH);
  ctx.fill();
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
