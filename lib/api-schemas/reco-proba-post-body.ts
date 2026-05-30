import { z } from 'zod';
import { USER_GOAL_TYPES } from '@/lib/user-profile-enums';

/**
 * Shared POST body for `/api/recommendation` and `/api/probability` (D.62).
 * Unknown top-level keys are allowed for forward compatibility.
 */
export const recoProbaPostBodySchema = z
  .object({
    profile: z.record(z.string(), z.unknown()).optional(),
    playground: z.boolean().optional(),
    /** Optional: pin this country first in ranked results (public numeric id only). */
    focusCountryId: z.number().int().positive().optional(),
    /** When true with focusCountryId, attach verified information models from observations. */
    includeInformationModels: z.boolean().optional(),
    /**
     * When the caller is **not** authenticated: override demo profile `goal_type` only.
     * Validated against the same enum as stored profiles — no arbitrary injection.
     */
    anonymous_goal_type: z.enum(USER_GOAL_TYPES).optional(),
  })
  .passthrough();

export type RecoProbaPostBody = z.infer<typeof recoProbaPostBodySchema>;
