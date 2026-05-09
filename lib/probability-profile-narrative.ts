/**
 * Textes pédagogiques liés au profil (âge, objectif) pour probabilités et recommandations.
 * Ne modifie aucun score numérique — uniquement des messages affichables.
 */

export type ProfileNarrativeSink = {
  /** ex. `reasons` (probabilités) ou `explanation` (reco) */
  primary: string[]
  /** ex. `strategy` (probabilités) — optionnel */
  secondary?: string[]
}

export function appendProfileContextNarratives(
  profile: Record<string, unknown>,
  sink: ProfileNarrativeSink,
): void {
  const { primary, secondary } = sink

  const age = Number(profile.age)
  if (Number.isFinite(age) && age >= 16 && age <= 120) {
    if (age <= 23) {
      primary.push(
        "Âge indiqué plutôt jeune : pour les études ou un premier long séjour, anticipez des justificatifs de financement et d'hébergement solides.",
      )
    } else if (age >= 55) {
      primary.push(
        'Parcours plus expérimenté : la stabilité des revenus, la couverture santé et les liens avec le Maroc peuvent être examinés de près.',
      )
    }
  }

  const g = String(profile.goal_type ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!g) return

  if (g.includes('tour') || g.includes('tourism')) {
    primary.push(
      'Objectif tourisme : gardez une cohérence entre durée du séjour, moyens et itinéraire pour renforcer la crédibilité du dossier.',
    )
  }
  if (
    g.includes('etud') ||
    g.includes('study') ||
    g.includes('formation') ||
    (g.includes('cours') && !g.includes('short'))
  ) {
    primary.push(
      "Objectif études / formation : vérifiez sur la fiche pays les blocs admission et visa étudiant avant de vous engager sur une destination.",
    )
    secondary?.push('Comparez les sections « éducation » et doctorat des fiches pays retenues.')
  }
  if (g.includes('travail') || g.includes('work')) {
    primary.push(
      "Objectif travail : la cohérence emploi / diplômes / employeur identifiable pèse fortement dans l'appréciation du risque.",
    )
  }
  if (g.includes('business') || g.includes('affair') || g.includes('invest')) {
    primary.push(
      "Objectif affaires ou investissement : documentez l'activité réelle (société, revenus, partenariats).",
    )
  }
  if (g.includes('short') && (g.includes('course') || g.includes('court'))) {
    primary.push(
      'Séjour court ou formation ciblée : vérifiez durée, justificatifs et cohérence avec l’objectif déclaré sur la fiche pays.',
    )
  }
}

/** Libellé court pour l’UI (profil stocké en base). */
export function formatGoalTypeLabelFr(goalType: unknown): string {
  const g = String(goalType ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (g.includes('tour')) return 'Tourisme'
  if (g.includes('etud') || g.includes('study') || g.includes('formation')) return 'Études / formation'
  if (g.includes('travail') || g.includes('work')) return 'Travail'
  if (g.includes('business') || g.includes('affair') || g.includes('invest')) return 'Affaires'
  if (g.includes('short') || g.includes('cours')) return 'Séjour court / cours'
  return String(goalType ?? '—').trim() || '—'
}
