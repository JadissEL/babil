'use client';

import { useEffect, useState } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  breakdownToRadarData,
  type RadarBreakdown,
} from '@/components/engine/ScoreBreakdownChart';
import { cn } from '@/lib/utils';

function useCompactViewport() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return compact;
}

export type PulseDualRadarChartProps = {
  destinationBreakdown: RadarBreakdown;
  idealBreakdown: RadarBreakdown;
  destinationLabel: string;
  className?: string;
  chartHeight?: number;
};

export function PulseDualRadarChart({
  destinationBreakdown,
  idealBreakdown,
  destinationLabel,
  className,
  chartHeight,
}: PulseDualRadarChartProps) {
  const compact = useCompactViewport();
  const height = chartHeight ?? (compact ? 240 : 280);
  const destRows = breakdownToRadarData(destinationBreakdown);
  const idealRows = breakdownToRadarData(idealBreakdown);
  const data = destRows.map((d, i) => ({
    subject: d.subject,
    profilIdeal: idealRows[i]?.value ?? 0,
    destination: d.value,
  }));

  return (
    <div className={cn('w-full min-w-0', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius={compact ? '66%' : '72%'} data={data}>
          <PolarGrid stroke="#0D1B3E" strokeOpacity={0.12} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#0D1B3E', fontSize: compact ? 10 : 11, fontWeight: 700 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar
            name="Profil idéal (pondérations)"
            dataKey="profilIdeal"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.28}
            strokeWidth={1.5}
          />
          <Radar
            name={destinationLabel}
            dataKey="destination"
            stroke="#0D1B3E"
            fill="#0D1B3E"
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontWeight: 700, color: '#0D1B3E' }}
            formatter={(value) => <span className="text-[#0D1B3E]">{value}</span>}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid rgba(13,27,62,0.12)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: 800, color: '#0D1B3E' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
