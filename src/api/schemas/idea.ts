import { z } from 'zod/v4'

export const ideaTracks = [
  'defi',
  'dev-tools',
  'infrastructure',
  'ai',
  'gaming',
  'refi',
  'consumer',
] as const

export const ideaCategories = [
  'dapp',
  'tool',
  'protocol',
  'infrastructure',
  'service',
] as const

export const ideaDifficulties = ['beginner', 'intermediate', 'advanced'] as const

export const ideaSourceTypes = ['telegram', 'web', 'mcp', 'manual'] as const

const signalItemSchema = z.object({
  type: z.string(),
  text: z.string(),
})

const signalSchema = z.object({
  verdict: z.string().optional(),
  reasoning: z.string().optional(),
  signals: z.array(signalItemSchema).optional(),
})

const buildStepSchema = z.object({
  order: z.number().int(),
  title: z.string(),
  description: z.string(),
})

const buildGuideSchema = z.object({
  overview: z.string().optional(),
  steps: z.array(buildStepSchema).optional(),
  stack_suggestion: z.string().optional(),
  time_estimate: z.string().optional(),
  hackathon_fit: z.string().optional(),
})

const chainOverrideValueSchema = z.object({
  note: z.string().optional(),
  stack_override: z.string().nullable().optional(),
})

export const createIdeaSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  title: z.string().min(1).max(500),
  tagline: z.string().min(1).max(1000),
  category: z.enum(ideaCategories).optional().default('dapp'),
  track: z.enum(ideaTracks).optional().default('defi'),
  difficulty: z.enum(ideaDifficulties).optional().default('intermediate'),
  tags: z.array(z.string().max(80)).optional().default([]),
  key_points: z.array(z.string().max(500)).optional().default([]),
  problem: z.string().max(5000).optional(),
  market_signal: signalSchema.optional().default({}),
  community_signal: signalSchema.optional().default({}),
  build_guide: buildGuideSchema.optional().default({}),
  supported_chains: z.array(z.string().max(80)).optional().default([]),
  chain_overrides: z.record(z.string(), chainOverrideValueSchema).optional().default({}),
  source_type: z.enum(ideaSourceTypes).optional(),
  source_url: z.string().max(2000).optional(),
  source_author: z.string().max(200).optional(),
  source_note: z.string().max(2000).optional(),
  is_featured: z.boolean().optional().default(false),
})

export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  tagline: z.string().min(1).max(1000).optional(),
  category: z.enum(ideaCategories).optional(),
  track: z.enum(ideaTracks).optional(),
  difficulty: z.enum(ideaDifficulties).optional(),
  tags: z.array(z.string().max(80)).optional(),
  key_points: z.array(z.string().max(500)).optional(),
  problem: z.string().max(5000).nullable().optional(),
  market_signal: signalSchema.optional(),
  community_signal: signalSchema.optional(),
  build_guide: buildGuideSchema.optional(),
  supported_chains: z.array(z.string().max(80)).optional(),
  chain_overrides: z.record(z.string(), chainOverrideValueSchema).optional(),
  source_type: z.enum(ideaSourceTypes).optional(),
  source_url: z.string().max(2000).nullable().optional(),
  source_author: z.string().max(200).nullable().optional(),
  source_note: z.string().max(2000).nullable().optional(),
  is_featured: z.boolean().optional(),
})

export const listIdeasQuerySchema = z.object({
  category: z.enum(ideaCategories).optional(),
  track: z.enum(ideaTracks).optional(),
  difficulty: z.enum(ideaDifficulties).optional(),
  tag: z.string().optional(),
  chain: z.string().optional(),
  search: z.string().max(500).optional(),
  featured: z.string().optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
  sort_by: z
    .enum(['votes', 'created_at', 'updated_at', 'title', 'difficulty'])
    .optional()
    .default('votes'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  per_page: z.string().optional().transform((v) => {
    const n = v ? parseInt(v, 10) : 30
    return Math.min(Math.max(1, n), 100)
  }),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>
export type ListIdeasQuery = z.infer<typeof listIdeasQuerySchema>
