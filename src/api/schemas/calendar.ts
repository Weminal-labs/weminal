import { z } from 'zod/v4'

export const milestoneTypes = ['deadline', 'office_hour', 'announcement', 'checkpoint', 'other'] as const

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(500),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  type: z.enum(milestoneTypes),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  notes: z.string().max(5000).optional(),
  completed: z.boolean().optional(),
})

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  date: z.iso.date().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  type: z.enum(milestoneTypes).optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  notes: z.string().max(5000).nullable().optional(),
  completed: z.boolean().optional(),
})

export const listMilestonesSchema = z.object({
  date_from: z.iso.date().optional(),
  date_to: z.iso.date().optional(),
  type: z.enum(milestoneTypes).optional(),
})

export const proposalStatuses = ['draft', 'submitted', 'accepted', 'rejected'] as const

export const upsertProposalSchema = z.object({
  content: z.string().max(50000).optional(),
  status: z.enum(proposalStatuses).optional().default('draft'),
  submission_url: z.url().nullable().optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
})

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
export type UpsertProposalInput = z.infer<typeof upsertProposalSchema>
