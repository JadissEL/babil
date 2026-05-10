/**
 * Corps JSON des réponses `POST /api/recommendation` et `POST /api/probability` (F.82).
 * Les tableaux renvoyés sont `RecommendationApiItem[]` et `ProbabilityApiRow[]`.
 */

import type {
  ProbabilityCountrySignals,
  ProbabilitySheetFieldDefault,
} from '@/lib/probability-result-display';
import type { ScoreDriver } from '@/lib/score-driver-explain';

export type RecommendationApiBreakdown = {
  visa: number;
  friction: number;
  goalMatch: number;
  risk: number;
};

export type RecommendationLevel = 'Very High' | 'High' | 'Medium' | 'Low';

export type RecommendationApiItem = {
  id: number;
  name: string;
  score: number;
  breakdown: RecommendationApiBreakdown;
  topDrivers: ScoreDriver[];
  countrySignals: ProbabilityCountrySignals;
  hasPhdStudies: boolean;
  explanation: string[];
  warnings: string[];
  reason: string;
  level: RecommendationLevel;
  /** Compat historique : score / 10 avec une décimale. */
  match_score: number;
};

export type ProbabilityApiBreakdown = {
  finance: number;
  profession: number;
  social: number;
  acceptance: number;
  visaEase: number;
  countryContext: number;
  appointmentEase: number;
  riskImmigration: number;
};

export type ProbabilityApiRow = {
  id: number;
  country: string;
  globalScore: number;
  level: string;
  hasPhdStudies: boolean;
  countrySignals: ProbabilityCountrySignals;
  reasons: string[];
  strategy: string[];
  breakdown: ProbabilityApiBreakdown;
  defaultsUsed: ProbabilitySheetFieldDefault[];
  topDrivers: ScoreDriver[];
};
