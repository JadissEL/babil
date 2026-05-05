'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export type RadarBreakdown = {
  visa: number
  friction: number
  goalMatch: number
  risk: number
}

export function breakdownToRadarData(b: RadarBreakdown) {
  return [
    { subject: 'Visa', value: Math.round(b.visa), fullMark: 100 },
    { subject: 'Friction', value: Math.round(b.friction), fullMark: 100 },
    { subject: 'Objectif', value: Math.round(b.goalMatch), fullMark: 100 },
    { subject: 'Anti-risque', value: Math.round(Math.max(0, 100 - b.risk)), fullMark: 100 },
  ]
}

type ScoreBreakdownChartProps = {
  breakdown: RadarBreakdown
  className?: string
}

export function ScoreBreakdownChart({ breakdown, className }: ScoreBreakdownChartProps) {
  const data = breakdownToRadarData(breakdown)

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v) => [`${Number(v)}/100`, '']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
