import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod/v4'
import {
  opportunityTypes,
  opportunityStatuses,
  opportunityFormats,
} from '../api/schemas/opportunity'
import {
  queryOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../api/lib/query-builder'
import { db } from '../api/lib/db'
import { formatListResponse, formatSingleResponse, truncateResponse } from './format'

const MAX_RESPONSE_SIZE = 50_000

// Write tools that require auth
const WRITE_TOOLS = new Set([
  'opportunity_create', 'opportunity_update', 'opportunity_delete',
  'block_create', 'block_update', 'block_delete',
  'milestone_create', 'milestone_update', 'milestone_delete',
  'proposal_update',
])

export function isWriteTool(toolName: string): boolean {
  return WRITE_TOOLS.has(toolName)
}

export function createMcpServer() {
  const server = new McpServer({
    name: 'crypto-opportunities',
    version: '1.0.0',
  })

  // --- Read Tools (public) ---

  server.tool(
    'opportunity_list',
    'List crypto opportunities (hackathons, grants, fellowships, bounties, bootcamps) with optional filters.',
    {
      type: z.enum(opportunityTypes).optional().describe('Filter by type'),
      status: z.enum(opportunityStatuses).optional().describe('Filter by status'),
      organization: z.string().optional().describe('Filter by organization'),
      blockchain: z.string().optional().describe('Filter by blockchain'),
      tag: z.string().optional().describe('Filter by tag'),
      search: z.string().optional().describe('Full-text search'),
      parent_hackathon_id: z.string().uuid().optional().describe('Filter bootcamps by parent hackathon UUID'),
      format: z.enum(opportunityFormats).optional().describe('Filter by format: in_person, online, hybrid'),
      sort_by: z.enum(['name', 'type', 'status', 'organization', 'start_date', 'end_date', 'reward_amount', 'created_at', 'updated_at']).optional().default('created_at'),
      sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
      page: z.number().int().min(1).optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async (params) => {
      const result = await queryOpportunities(params)
      const text = formatListResponse(result, params.type)
      return { content: [{ type: 'text', text: truncateResponse(text, MAX_RESPONSE_SIZE) }] }
    }
  )

  server.tool(
    'opportunity_get',
    'Get a single opportunity by ID.',
    { id: z.string().uuid().describe('Opportunity UUID') },
    async ({ id }) => {
      const data = await getOpportunity(id)
      if (!data) return { content: [{ type: 'text', text: `Opportunity ${id} not found.` }], isError: true }
      return { content: [{ type: 'text', text: formatSingleResponse(data) }] }
    }
  )

  server.tool(
    'milestone_list',
    'List milestones and deadlines.',
    {
      opportunity_id: z.string().uuid().optional(),
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      type: z.enum(['deadline', 'office_hour', 'announcement', 'checkpoint', 'other']).optional(),
    },
    async (params) => {
      try {
        let query = db
          .selectFrom('milestones')
          .innerJoin('opportunities', 'opportunities.id', 'milestones.opportunity_id')
          .select([
            'milestones.id',
            'milestones.opportunity_id',
            'milestones.title',
            'milestones.date',
            'milestones.time',
            'milestones.type',
            'milestones.links',
            'milestones.notes',
            'milestones.completed',
            'milestones.created_at',
            'milestones.updated_at',
            'opportunities.id as opp_id',
            'opportunities.name as opp_name',
            'opportunities.type as opp_type',
          ])
          .orderBy('milestones.date', 'asc')

        if (params.opportunity_id) query = query.where('milestones.opportunity_id', '=', params.opportunity_id)
        if (params.date_from) query = query.where('milestones.date', '>=', params.date_from)
        if (params.date_to) query = query.where('milestones.date', '<=', params.date_to)
        if (params.type) query = query.where('milestones.type', '=', params.type)

        const rows = await query.execute()
        const data = rows.map((r) => {
          const { opp_id, opp_name, opp_type, ...rest } = r as Record<string, unknown>
          return { ...rest, opportunities: { id: opp_id, name: opp_name, type: opp_type } }
        })
        return { content: [{ type: 'text' as const, text: `Found ${data.length} milestones\n\n${JSON.stringify(data, null, 2)}` }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  server.tool(
    'proposal_get',
    'Get the proposal for an opportunity.',
    { opportunity_id: z.string().uuid() },
    async ({ opportunity_id }) => {
      try {
        const data = await db
          .selectFrom('proposals')
          .selectAll()
          .where('opportunity_id', '=', opportunity_id)
          .executeTakeFirst()
        if (!data) return { content: [{ type: 'text' as const, text: `No proposal for ${opportunity_id}` }] }
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  // --- Write Tools (require auth) ---

  server.tool(
    'opportunity_create',
    'Create a new opportunity. Requires API key.',
    {
      name: z.string(), type: z.enum(opportunityTypes),
      description: z.string().optional(), status: z.enum(opportunityStatuses).optional(),
      organization: z.string().optional(), website_url: z.string().optional(),
      start_date: z.string().optional(), end_date: z.string().optional(),
      reward_amount: z.number().optional(), reward_currency: z.string().optional(),
      reward_token: z.string().optional(), blockchains: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
      notes: z.string().optional(),
      format: z.enum(opportunityFormats).optional(),
      location: z.string().optional(),
      parent_hackathon_id: z.string().uuid().optional().describe('Parent hackathon UUID (bootcamp only)'),
    },
    async (params) => {
      const data = await createOpportunity(params)
      return { content: [{ type: 'text', text: `Created ${params.type}: "${params.name}" (${data.id})\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'opportunity_update',
    'Update an opportunity. Requires API key.',
    {
      id: z.string().uuid(), name: z.string().optional(), type: z.enum(opportunityTypes).optional(),
      description: z.string().optional(), status: z.enum(opportunityStatuses).optional(),
      organization: z.string().optional(), website_url: z.string().optional(),
      start_date: z.string().optional(), end_date: z.string().optional(),
      reward_amount: z.number().optional(), blockchains: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(), notes: z.string().optional(),
      format: z.enum(opportunityFormats).optional(), location: z.string().nullable().optional(),
      parent_hackathon_id: z.string().uuid().nullable().optional().describe('Parent hackathon UUID (bootcamp only, null to unlink)'),
    },
    async ({ id, ...updates }) => {
      const data = await updateOpportunity(id, updates)
      if (!data) return { content: [{ type: 'text', text: `Not found: ${id}` }], isError: true }
      return { content: [{ type: 'text', text: `Updated: "${data.name}"\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'opportunity_delete',
    'Delete an opportunity. Requires API key.',
    { id: z.string().uuid() },
    async ({ id }) => {
      const data = await deleteOpportunity(id)
      if (!data) return { content: [{ type: 'text', text: `Not found: ${id}` }], isError: true }
      return { content: [{ type: 'text', text: `Deleted: "${data.name}" (${id})` }] }
    }
  )

  server.tool(
    'milestone_create',
    'Add a milestone to an opportunity. Requires API key.',
    {
      opportunity_id: z.string().uuid(), title: z.string(), date: z.string(),
      time: z.string().optional(),
      type: z.enum(['deadline', 'office_hour', 'announcement', 'checkpoint', 'other']),
      notes: z.string().optional(),
    },
    async (params) => {
      try {
        const data = await db
          .insertInto('milestones')
          .values(params as never)
          .returningAll()
          .executeTakeFirstOrThrow()
        return { content: [{ type: 'text' as const, text: `Created milestone: "${params.title}" on ${params.date}\n\n${JSON.stringify(data, null, 2)}` }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  server.tool(
    'milestone_update',
    'Update a milestone. Requires API key.',
    {
      id: z.string().uuid(), title: z.string().optional(), date: z.string().optional(),
      time: z.string().optional(),
      type: z.enum(['deadline', 'office_hour', 'announcement', 'checkpoint', 'other']).optional(),
      completed: z.boolean().optional(), notes: z.string().optional(),
    },
    async ({ id, ...updates }) => {
      try {
        const data = await db
          .updateTable('milestones')
          .set(updates as never)
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirstOrThrow()
        return { content: [{ type: 'text' as const, text: `Updated milestone "${data.title}"\n\n${JSON.stringify(data, null, 2)}` }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  server.tool(
    'milestone_delete',
    'Delete a milestone. Requires API key.',
    { id: z.string().uuid() },
    async ({ id }) => {
      try {
        const data = await db
          .deleteFrom('milestones')
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirstOrThrow()
        return { content: [{ type: 'text' as const, text: `Deleted milestone: "${data.title}" (${id})` }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  server.tool(
    'proposal_update',
    'Create or update a proposal. Requires API key.',
    {
      opportunity_id: z.string().uuid(),
      content: z.string().optional(),
      status: z.enum(['draft', 'submitted', 'accepted', 'rejected']).optional(),
      submission_url: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    },
    async ({ opportunity_id, ...input }) => {
      try {
        const data = await db
          .insertInto('proposals')
          .values({ ...input, opportunity_id } as never)
          .onConflict((oc) => oc.column('opportunity_id').doUpdateSet(input as never))
          .returningAll()
          .executeTakeFirstOrThrow()
        return { content: [{ type: 'text' as const, text: `Proposal ${data.status}: ${opportunity_id}\n\n${JSON.stringify(data, null, 2)}` }] }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Database error'
        return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
      }
    }
  )

  // --- Resources ---

  server.resource('types', 'opportunity://meta/types', { description: 'Valid opportunity types', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'opportunity://meta/types', text: JSON.stringify(opportunityTypes, null, 2), mimeType: 'application/json' }] }))

  server.resource('statuses', 'opportunity://meta/statuses', { description: 'Valid status values', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'opportunity://meta/statuses', text: JSON.stringify(opportunityStatuses, null, 2), mimeType: 'application/json' }] }))

  return server
}
