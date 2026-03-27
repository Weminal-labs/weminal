import { z } from 'zod/v4'

export const opportunityTypes = [
  'hackathon',
  'grant',
  'fellowship',
  'bounty',
  'bootcamp',
] as const

export const opportunityStatuses = [
  'discovered',
  'evaluating',
  'applying',
  'accepted',
  'in_progress',
  'submitted',
  'completed',
  'rejected',
  'cancelled',
] as const

export const linkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

export const createOpportunitySchema = z.object({
  name: z.string().min(1).max(500),
  type: z.enum(opportunityTypes),
  description: z.string().max(10000).optional(),
  status: z.enum(opportunityStatuses).optional(),
  organization: z.string().max(500).optional(),
  website_url: z.url().optional(),
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
  reward_amount: z.number().min(0).optional(),
  reward_currency: z.string().max(10).optional(),
  reward_token: z.string().max(50).optional(),
  blockchains: z.array(z.string().max(100)).optional(),
  tags: z.array(z.string().max(100)).optional(),
  links: z.array(linkSchema).optional(),
  notes: z.string().max(10000).optional(),
  parent_hackathon_id: z.string().uuid().optional(),
}).refine(
  (data) => data.parent_hackathon_id == null || data.type === 'bootcamp',
  { message: 'parent_hackathon_id is only valid for type=bootcamp', path: ['parent_hackathon_id'] }
)

export const updateOpportunitySchema = z.object({
  name: z.string().min(1).max(500).optional(),
  type: z.enum(opportunityTypes).optional(),
  description: z.string().max(10000).nullable().optional(),
  status: z.enum(opportunityStatuses).optional(),
  organization: z.string().max(500).nullable().optional(),
  website_url: z.url().nullable().optional(),
  start_date: z.iso.date().nullable().optional(),
  end_date: z.iso.date().nullable().optional(),
  reward_amount: z.number().min(0).nullable().optional(),
  reward_currency: z.string().max(10).optional(),
  reward_token: z.string().max(50).nullable().optional(),
  blockchains: z.array(z.string().max(100)).optional(),
  tags: z.array(z.string().max(100)).optional(),
  links: z.array(linkSchema).optional(),
  notes: z.string().max(10000).nullable().optional(),
  parent_hackathon_id: z.string().uuid().nullable().optional(),
})

export const listQuerySchema = z.object({
  type: z.enum(opportunityTypes).optional(),
  status: z.enum(opportunityStatuses).optional(),
  organization: z.string().optional(),
  blockchain: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().max(500).optional(),
  parent_hackathon_id: z.string().uuid().optional(),
  start_date_gte: z.iso.date().optional(),
  end_date_lte: z.iso.date().optional(),
  sort_by: z
    .enum([
      'name',
      'type',
      'status',
      'organization',
      'start_date',
      'end_date',
      'reward_amount',
      'created_at',
      'updated_at',
    ])
    .optional()
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(200).optional().default(50),
})

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>
export type ListQueryInput = z.infer<typeof listQuerySchema>
