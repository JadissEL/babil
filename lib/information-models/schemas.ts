import { z } from 'zod'

export const VisaModelSchema = z.object({
  destinationCountry: z.string(),
  visaType: z.string().optional(),
  processingTime: z.string().optional(),
  difficulty: z.string().optional(),
  moroccoApplicability: z.enum(['include', 'exclude', 'review']).optional(),
  evidenceFieldPaths: z.array(z.string()).default([]),
})

export const ScholarshipModelSchema = z.object({
  destinationCountry: z.string(),
  programName: z.string().optional(),
  deadline: z.string().optional(),
  fundingLevel: z.string().optional(),
  evidenceFieldPaths: z.array(z.string()).default([]),
})

export const JobOpportunityModelSchema = z.object({
  destinationCountry: z.string(),
  sponsorshipRequired: z.boolean().optional(),
  salaryBand: z.string().optional(),
  evidenceFieldPaths: z.array(z.string()).default([]),
})

export const BusinessSetupModelSchema = z.object({
  destinationCountry: z.string(),
  setupSteps: z.array(z.string()).default([]),
  estimatedCost: z.string().optional(),
  evidenceFieldPaths: z.array(z.string()).default([]),
})

export const ResidencePathModelSchema = z.object({
  destinationCountry: z.string(),
  pathType: z.string().optional(),
  timelineYears: z.number().optional(),
  evidenceFieldPaths: z.array(z.string()).default([]),
})

export type VisaModel = z.infer<typeof VisaModelSchema>
export type ScholarshipModel = z.infer<typeof ScholarshipModelSchema>
export type JobOpportunityModel = z.infer<typeof JobOpportunityModelSchema>
export type BusinessSetupModel = z.infer<typeof BusinessSetupModelSchema>
export type ResidencePathModel = z.infer<typeof ResidencePathModelSchema>

export const INFORMATION_MODEL_TYPES = [
  'visa',
  'scholarship',
  'job',
  'business',
  'residence',
] as const

export type InformationModelType = (typeof INFORMATION_MODEL_TYPES)[number]
