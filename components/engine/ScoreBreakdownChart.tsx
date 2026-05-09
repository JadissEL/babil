'use client'

import { useEffect, useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { RECO_RADAR_AXIS_DESCRIPTIONS } from '@/lib/recommendation-radar-axes'
import { cn } from '@/lib/utils'

function useCompactViewport() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => setCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return compact
}

export type RadarBreakdown = {
  visa: number
  friction: number
  goalMatch: number
  risk: number
}

export type RadarDatum = {
  subject: string
  value: number
  fullMark: number
  description: string
}

export function breakdownToRadarData(b: RadarBreakdown): RadarDatum[] {
  const rows: RadarDatum[] = [
    { subject: 'Visa', value: Math.round(b.visa), fullMark: 100, description: '' },
    { subject: 'Friction', value: Math.round(b.friction), fullMark: 100, description: '' },
    { subject: 'Objectif', value: Math.round(b.goalMatch), fullMark: 100, description: '' },
    {
      subject: 'Anti-risque',
      value: Math.round(Math.max(0, 100 - b.risk)),
      fullMark: 100,
      description: '',
    },
  ]
  for (const row of rows) {
    row.description = RECO_RADAR_AXIS_DESCRIPTIONS[row.subject] ?? ''
  }
  return rows
}

function RadarAxisTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: RadarDatum }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as RadarDatum | undefined
  if (!p) return null
  return (
    <div className="max-w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-line bg-[#1e293b] p-3 text-left shadow-lg">
      <p className="text-xs font-black text-white">{p.subject}</p>
      {p.description ? (
        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-300">{p.description}</p>
      ) : null}
      <p className="mt-2 text-[11px] font-bold text-slate-200">{p.value}/100</p>
    </div>
  )
}

export function RecoRadarAxisLegend({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        'mt-3 rounded-lg border border-line/80 bg-inset/60 p-3 text-left [&_summary]:marker:text-muted',
        className,
      )}
    >
      <summary className="cursor-pointer text-xs font-black text-text outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        Définitions des axes (radar reco)
      </summary>
      <dl className="mt-3 space-y-2.5 text-[11px] text-muted">
        {Object.entries(RECO_RADAR_AXIS_DESCRIPTIONS).map(([subject, desc]) => (
          <div key={subject}>
            <dt className="font-black text-text">{subject}</dt>
            <dd className="mt-0.5 leading-snug">{desc}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

type ScoreBreakdownChartProps = {
  breakdown: RadarBreakdown
  className?: string
  /** Hauteur du graphique en px (ex. comparaison multi-pays). */
  chartHeight?: number
  /** Bloc repliable avec les définitions (mobile / accessibilité). */
  withAxisLegend?: boolean
  classNameLegend?: string
}

export function ScoreBreakdownChart({
  breakdown,
  className,
  chartHeight,
  withAxisLegend = true,
  classNameLegend,
}: ScoreBreakdownChartProps) {
  const data = breakdownToRadarData(breakdown)
  const compact = useCompactViewport()
  const height = chartHeight ?? (compact ? 216 : 276)
  const tickSize = compact ? 10 : 11
  const radiusTick = compact ? 9 : 10

  return (
    <div className={cn('w-full min-w-0', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius={compact ? '68%' : '75%'} data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: tickSize }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: radiusTick }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip content={<RadarAxisTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      {withAxisLegend ? <RecoRadarAxisLegend className={classNameLegend} /> : null}
    </div>
  )
}
