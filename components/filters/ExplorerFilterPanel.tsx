'use client';

import type { ExplorerFilterProfile } from '@/lib/explorer-filter-profiles';
import type { ExplorerBudget, ExplorerFrictionBand } from '@/lib/explorer-filter-engine';
import { cn } from '@/lib/utils';

const BUDGET_OPTIONS: { value: ExplorerBudget; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyen' },
  { value: 'high', label: 'Élevé' },
];

const FRICTION_OPTIONS: { value: ExplorerFrictionBand; label: string }[] = [
  { value: 'all', label: 'Toute friction' },
  { value: 'low', label: 'Faible (rapide)' },
  { value: 'medium', label: 'Modérée' },
  { value: 'high', label: 'Élevée' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'Low', label: 'Facile' },
  { value: 'Medium', label: 'Moyenne' },
  { value: 'High', label: 'Difficile' },
  { value: 'Extreme', label: 'Critique' },
];

const REGION_OPTIONS = [
  { value: 'all', label: 'Toutes les régions' },
  { value: 'schengen', label: 'Schengen' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asie' },
  { value: 'africa', label: 'Afrique' },
  { value: 'americas', label: 'Amériques' },
  { value: 'oceania', label: 'Océanie' },
];

type ExplorerFilterPanelProps = {
  profile: ExplorerFilterProfile;
  budget: ExplorerBudget;
  difficulty: string;
  friction: ExplorerFrictionBand;
  region: string;
  onBudgetChange: (v: ExplorerBudget) => void;
  onDifficultyChange: (v: string) => void;
  onFrictionChange: (v: ExplorerFrictionBand) => void;
  onRegionChange: (v: string) => void;
  compact?: boolean;
  className?: string;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
  compact,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', compact ? 'flex-1' : '')}>
      <span className="text-[9px] font-black uppercase tracking-widest text-[#0D1B3E]/55">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'rounded-xl border border-[#0D1B3E]/12 bg-white px-3 py-2 text-sm font-bold text-[#0D1B3E]',
          compact && 'text-xs',
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ExplorerFilterPanel({
  profile,
  budget,
  difficulty,
  friction,
  region,
  onBudgetChange,
  onDifficultyChange,
  onFrictionChange,
  onRegionChange,
  compact = false,
  className,
}: ExplorerFilterPanelProps) {
  const show = new Set(profile.dimensions);

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3',
        compact ? 'gap-2' : 'gap-4',
        className,
      )}
      role="group"
      aria-label="Filtres selon votre parcours"
    >
      {show.has('region') ? (
        <FilterSelect
          label="Région"
          value={region}
          options={REGION_OPTIONS}
          onChange={onRegionChange}
          compact={compact}
        />
      ) : null}
      {show.has('difficulty') ? (
        <FilterSelect
          label={profile.labels.difficulty ?? 'Difficulté'}
          value={difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={onDifficultyChange}
          compact={compact}
        />
      ) : null}
      {show.has('friction') ? (
        <FilterSelect
          label={profile.labels.friction ?? 'Friction'}
          value={friction}
          options={FRICTION_OPTIONS}
          onChange={(v) => onFrictionChange(v as ExplorerFrictionBand)}
          compact={compact}
        />
      ) : null}
      {show.has('budgetBand') ? (
        <FilterSelect
          label={profile.labels.budgetBand ?? 'Budget'}
          value={budget}
          options={BUDGET_OPTIONS}
          onChange={(v) => onBudgetChange(v as ExplorerBudget)}
          compact={compact}
        />
      ) : null}
      {show.has('moduleAccess') && profile.labels.moduleAccess ? (
        <p className="text-[10px] font-medium leading-snug text-[#0D1B3E]/60">
          Filtre actif : {profile.labels.moduleAccess}
        </p>
      ) : null}
    </div>
  );
}
