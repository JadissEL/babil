import { z } from 'zod';

/**
 * Shared POST body for `/api/recommendation` and `/api/probability` (D.62).
 * Unknown top-level keys are allowed for forward compatibility.
 */
export const recoProbaPostBodySchema = z
  .object({
    profile: z.record(z.string(), z.unknown()).optional(),
    playground: z.boolean().optional(),
  })
  .passthrough();

export type RecoProbaPostBody = z.infer<typeof recoProbaPostBodySchema>;
