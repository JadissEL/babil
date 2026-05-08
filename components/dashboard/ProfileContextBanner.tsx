'use client'

import Link from 'next/link'
import { UserCircle } from 'lucide-react'

import { formatGoalTypeLabelFr } from '@/lib/probability-profile-narrative'

type Props = {
  profile: Record<string, unknown>
  /** Ajuste la phrase d’aide selon le moteur */
  variant?: 'probability' | 'recommendation'
}

export function ProfileContextBanner({ profile, variant = 'probability' }: Props) {
  const age = Number(profile.age)
  const income = Number(profile.income ?? 0)
  const savings = Number(profile.savings ?? 0)
  const cnss = Boolean(profile.CNSS_status)
  const familyEu = Boolean(profile.family_in_europe)
  const marital = String(profile.marital_status ?? '').trim()
  const goalLabel = formatGoalTypeLabelFr(profile.goal_type)

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)

  const hint =
    variant === 'recommendation'
      ? 'Le premier pays recommandé affiche en tête des rappels liés à votre âge et à votre objectif (comme en probabilités).'
      : 'Le détail par pays peut inclure des messages adaptés à votre âge et à votre objectif.';

  return (
    <div className="mb-8 rounded-2xl border border-primary/25 bg-primary-soft/35 p-5 shadow-soft sm:rounded-[2rem] sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black text-text sm:text-base">
          <UserCircle className="h-5 w-5 shrink-0 text-primary" />
          Profil pris en compte dans ce calcul
        </h2>
        <Link
          href="/profile"
          className="text-xs font-bold text-primary underline-offset-2 hover:underline sm:text-sm"
        >
          Modifier
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {Number.isFinite(age) && age >= 16 && age <= 120 ? (
          <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
            Âge : {age} ans
          </span>
        ) : null}
        <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
          Objectif : {goalLabel}
        </span>
        <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
          CNSS : {cnss ? 'oui' : 'non'}
        </span>
        <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
          Revenus : {fmtMoney(income)}
        </span>
        <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
          Épargne : {fmtMoney(savings)}
        </span>
        <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
          Famille en Europe : {familyEu ? 'oui' : 'non'}
        </span>
        {marital ? (
          <span className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-text">
            Situation : {marital}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[11px] font-medium leading-relaxed text-muted sm:text-xs">{hint}</p>
    </div>
  )
}
