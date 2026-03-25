import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod/v4'
import {
  opportunityTypes,
  opportunityStatuses,
} from '../api/schemas/opportunity'
import {
  queryOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../api/lib/query-builder'
import { getSupabase } from '../api/lib/supabase'
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
    'List crypto opportunities (hackathons, grants, fellowships, bounties) with optional filters.',
    {
      type: z.enum(opportunityTypes).optional().describe('Filter by type'),
      status: z.enum(opportunityStatuses).optional().describe('Filter by status'),
      organization: z.string().optional().describe('Filter by organization'),
      blockchain: z.string().optional().describe('Filter by blockchain'),
      tag: z.string().optional().describe('Filter by tag'),
      search: z.string().optional().describe('Full-text search'),
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
    'block_list',
    'List calendar blocks (scheduled work sessions).',
    {
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      opportunity_id: z.string().uuid().optional(),
      status: z.enum(['planned', 'in_progress', 'done', 'skipped']).optional(),
    },
    async (params) => {
      const client = getSupabase()
      let query = client.from('calendar_blocks').select('*, opportunities(id, name, type, organization)').order('date', { ascending: true })
      if (params.date_from) query = query.gte('date', params.date_from)
      if (params.date_to) query = query.lte('date', params.date_to)
      if (params.opportunity_id) query = query.eq('opportunity_id', params.opportunity_id)
      if (params.status) query = query.eq('status', params.status)
      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Found ${data?.length ?? 0} blocks\n\n${JSON.stringify(data, null, 2)}` }] }
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
      const client = getSupabase()
      let query = client.from('milestones').select('*, opportunities(id, name, type)').order('date', { ascending: true })
      if (params.opportunity_id) query = query.eq('opportunity_id', params.opportunity_id)
      if (params.date_from) query = query.gte('date', params.date_from)
      if (params.date_to) query = query.lte('date', params.date_to)
      if (params.type) query = query.eq('type', params.type)
      const { data, error } = await query
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Found ${data?.length ?? 0} milestones\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'proposal_get',
    'Get the proposal for an opportunity.',
    { opportunity_id: z.string().uuid() },
    async ({ opportunity_id }) => {
      const client = getSupabase()
      const { data, error } = await client.from('proposals').select('*').eq('opportunity_id', opportunity_id).maybeSingle()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      if (!data) return { content: [{ type: 'text' as const, text: `No proposal for ${opportunity_id}` }] }
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
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
    'block_create',
    'Create a calendar block. Requires API key.',
    {
      title: z.string(), date: z.string(),
      slot: z.enum(['AM', 'PM', 'ALL_DAY']).optional().default('AM'),
      hours: z.number().optional().default(4),
      opportunity_id: z.string().uuid().optional(),
      notes: z.string().optional(),
      status: z.enum(['planned', 'in_progress', 'done', 'skipped']).optional().default('planned'),
    },
    async (params) => {
      const client = getSupabase()
      const { data, error } = await client.from('calendar_blocks').insert(params).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Created block: "${params.title}" on ${params.date}\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'block_update',
    'Update a calendar block. Requires API key.',
    {
      id: z.string().uuid(), title: z.string().optional(), date: z.string().optional(),
      slot: z.enum(['AM', 'PM', 'ALL_DAY']).optional(), hours: z.number().optional(),
      notes: z.string().optional(), status: z.enum(['planned', 'in_progress', 'done', 'skipped']).optional(),
    },
    async ({ id, ...updates }) => {
      const client = getSupabase()
      const { data, error } = await client.from('calendar_blocks').update(updates).eq('id', id).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Updated block "${data.title}"\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'block_delete',
    'Delete a calendar block. Requires API key.',
    { id: z.string().uuid() },
    async ({ id }) => {
      const client = getSupabase()
      const { data, error } = await client.from('calendar_blocks').delete().eq('id', id).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Deleted block: "${data.title}" (${id})` }] }
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
      const client = getSupabase()
      const { data, error } = await client.from('milestones').insert(params).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Created milestone: "${params.title}" on ${params.date}\n\n${JSON.stringify(data, null, 2)}` }] }
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
      const client = getSupabase()
      const { data, error } = await client.from('milestones').update(updates).eq('id', id).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Updated milestone "${data.title}"\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  server.tool(
    'milestone_delete',
    'Delete a milestone. Requires API key.',
    { id: z.string().uuid() },
    async ({ id }) => {
      const client = getSupabase()
      const { data, error } = await client.from('milestones').delete().eq('id', id).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Deleted milestone: "${data.title}" (${id})` }] }
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
      const client = getSupabase()
      const { data, error } = await client.from('proposals').upsert({ ...input, opportunity_id }, { onConflict: 'opportunity_id' }).select().single()
      if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
      return { content: [{ type: 'text' as const, text: `Proposal ${data.status}: ${opportunity_id}\n\n${JSON.stringify(data, null, 2)}` }] }
    }
  )

  // --- Resources ---

  server.resource('types', 'opportunity://meta/types', { description: 'Valid opportunity types', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'opportunity://meta/types', text: JSON.stringify(opportunityTypes, null, 2), mimeType: 'application/json' }] }))

  server.resource('statuses', 'opportunity://meta/statuses', { description: 'Valid status values', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'opportunity://meta/statuses', text: JSON.stringify(opportunityStatuses, null, 2), mimeType: 'application/json' }] }))

  return server
}
