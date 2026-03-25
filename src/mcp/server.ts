import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
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

const server = new McpServer({
  name: 'crypto-opportunities',
  version: '1.0.0',
})

// --- Tools ---

server.tool(
  'opportunity_list',
  'List crypto opportunities (hackathons, grants, fellowships, bounties) with optional filters. Returns paginated results.',
  {
    type: z.enum(opportunityTypes).optional().describe('Filter by opportunity type'),
    status: z.enum(opportunityStatuses).optional().describe('Filter by status'),
    organization: z.string().optional().describe("Filter by organization (e.g. 'ETHGlobal', 'Gitcoin')"),
    blockchain: z.string().optional().describe("Filter by blockchain name (e.g. 'Ethereum')"),
    tag: z.string().optional().describe('Filter by tag'),
    search: z.string().optional().describe('Full-text search on name and description'),
    start_date_gte: z.string().optional().describe('Start date >= value (YYYY-MM-DD)'),
    end_date_lte: z.string().optional().describe('End date <= value (YYYY-MM-DD)'),
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
  'Get a single opportunity (hackathon, grant, fellowship, or bounty) by ID. Returns full details.',
  {
    id: z.string().uuid().describe('Opportunity UUID'),
  },
  async ({ id }) => {
    const data = await getOpportunity(id)
    if (!data) {
      return { content: [{ type: 'text', text: `Opportunity with ID ${id} not found.` }], isError: true }
    }
    const text = formatSingleResponse(data)
    return { content: [{ type: 'text', text }] }
  }
)

server.tool(
  'opportunity_create',
  'Create a new opportunity entry. Supports hackathons, grants, fellowships, and bounties. Name and type are required.',
  {
    name: z.string().describe('Opportunity name'),
    type: z.enum(opportunityTypes).describe('Opportunity type'),
    description: z.string().optional().describe('Detailed description'),
    status: z.enum(opportunityStatuses).optional().describe('Pipeline status'),
    organization: z.string().optional().describe('Who runs it'),
    website_url: z.string().optional().describe('Main website URL'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    reward_amount: z.number().optional().describe('Monetary value'),
    reward_currency: z.string().optional().describe('Currency code (default: USD)'),
    reward_token: z.string().optional().describe('Token symbol (ETH, SOL, USDC)'),
    blockchains: z.array(z.string()).optional().describe('Associated blockchains'),
    tags: z.array(z.string()).optional().describe('Categorization tags'),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional().describe('Related links [{label, url}]'),
    notes: z.string().optional().describe('Internal notes'),
  },
  async (params) => {
    const data = await createOpportunity(params)
    return {
      content: [{
        type: 'text',
        text: `Created ${params.type}: "${params.name}" (ID: ${data.id})\n\n${JSON.stringify(data, null, 2)}`
      }]
    }
  }
)

server.tool(
  'opportunity_update',
  'Update an existing opportunity (hackathon, grant, fellowship, or bounty). Only provided fields are changed.',
  {
    id: z.string().uuid().describe('Opportunity UUID to update'),
    name: z.string().optional().describe('Opportunity name'),
    type: z.enum(opportunityTypes).optional().describe('Opportunity type'),
    description: z.string().optional().describe('Detailed description'),
    status: z.enum(opportunityStatuses).optional().describe('Pipeline status'),
    organization: z.string().optional().describe('Who runs it'),
    website_url: z.string().optional().describe('Main website URL'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    reward_amount: z.number().optional().describe('Monetary value'),
    reward_currency: z.string().optional().describe('Currency code'),
    reward_token: z.string().optional().describe('Token symbol'),
    blockchains: z.array(z.string()).optional().describe('Associated blockchains'),
    tags: z.array(z.string()).optional().describe('Categorization tags'),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional().describe('Related links'),
    notes: z.string().optional().describe('Internal notes'),
  },
  async ({ id, ...updates }) => {
    if (Object.keys(updates).length === 0) {
      return { content: [{ type: 'text', text: 'No fields provided to update.' }], isError: true }
    }
    const data = await updateOpportunity(id, updates)
    if (!data) {
      return { content: [{ type: 'text', text: `Opportunity with ID ${id} not found.` }], isError: true }
    }
    return {
      content: [{
        type: 'text',
        text: `Updated ${data.type}: "${data.name}" (ID: ${data.id})\n\nChanged fields: ${Object.keys(updates).join(', ')}\n\n${JSON.stringify(data, null, 2)}`
      }]
    }
  }
)

server.tool(
  'opportunity_delete',
  'Delete an opportunity (hackathon, grant, fellowship, or bounty) by ID. Returns confirmation.',
  {
    id: z.string().uuid().describe('Opportunity UUID to delete'),
  },
  async ({ id }) => {
    const data = await deleteOpportunity(id)
    if (!data) {
      return { content: [{ type: 'text', text: `Opportunity with ID ${id} not found.` }], isError: true }
    }
    return {
      content: [{
        type: 'text',
        text: `Deleted ${data.type}: "${data.name}" (ID: ${id})`
      }]
    }
  }
)

// --- Calendar Block Tools ---

server.tool(
  'block_list',
  'List calendar blocks (scheduled work sessions) for crypto opportunities. Filter by date range or opportunity.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    opportunity_id: z.string().uuid().optional().describe('Filter by opportunity'),
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
    const summary = `Found ${data?.length ?? 0} calendar blocks\n\n`
    const text = summary + JSON.stringify(data, null, 2)
    return { content: [{ type: 'text' as const, text: truncateResponse(text, MAX_RESPONSE_SIZE) }] }
  }
)

server.tool(
  'block_create',
  'Create a calendar block (scheduled work session). Link to an opportunity or create a custom event.',
  {
    title: z.string().describe('Block title'),
    date: z.string().describe('Date (YYYY-MM-DD)'),
    slot: z.enum(['AM', 'PM', 'ALL_DAY']).optional().default('AM').describe('Time slot'),
    hours: z.number().optional().default(4).describe('Hours planned (0.5-12)'),
    opportunity_id: z.string().uuid().optional().describe('Link to opportunity (omit for custom event)'),
    notes: z.string().optional().describe('Notes for this session'),
    status: z.enum(['planned', 'in_progress', 'done', 'skipped']).optional().default('planned'),
  },
  async (params) => {
    const client = getSupabase()
    const { data, error } = await client.from('calendar_blocks').insert(params).select().single()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text' as const, text: `Created block: "${params.title}" on ${params.date} (${params.slot}, ${params.hours}h)\n\n${JSON.stringify(data, null, 2)}` }] }
  }
)

server.tool(
  'block_update',
  'Update a calendar block. Change date, slot, hours, notes, or status.',
  {
    id: z.string().uuid().describe('Block ID'),
    title: z.string().optional(),
    date: z.string().optional(),
    slot: z.enum(['AM', 'PM', 'ALL_DAY']).optional(),
    hours: z.number().optional(),
    notes: z.string().optional(),
    status: z.enum(['planned', 'in_progress', 'done', 'skipped']).optional(),
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
  'Delete a calendar block by ID.',
  { id: z.string().uuid().describe('Block ID') },
  async ({ id }) => {
    const client = getSupabase()
    const { data, error } = await client.from('calendar_blocks').delete().eq('id', id).select().single()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text' as const, text: `Deleted block: "${data.title}" (${id})` }] }
  }
)

// --- Milestone Tools ---

server.tool(
  'milestone_list',
  'List milestones and deadlines for crypto opportunities. Filter by opportunity, date range, or type (deadline, office_hour, announcement, checkpoint).',
  {
    opportunity_id: z.string().uuid().optional().describe('Filter by opportunity'),
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
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
    const summary = `Found ${data?.length ?? 0} milestones\n\n`
    const text = summary + JSON.stringify(data, null, 2)
    return { content: [{ type: 'text' as const, text: truncateResponse(text, MAX_RESPONSE_SIZE) }] }
  }
)

server.tool(
  'milestone_create',
  'Add a milestone to an opportunity. Use for deadlines, office hours, registration dates, result announcements.',
  {
    opportunity_id: z.string().uuid().describe('Opportunity ID'),
    title: z.string().describe('Milestone title'),
    date: z.string().describe('Date (YYYY-MM-DD)'),
    time: z.string().optional().describe('Time (HH:MM) for office hours'),
    type: z.enum(['deadline', 'office_hour', 'announcement', 'checkpoint', 'other']).describe('Milestone type'),
    notes: z.string().optional(),
  },
  async (params) => {
    const client = getSupabase()
    const { data, error } = await client.from('milestones').insert(params).select().single()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text' as const, text: `Created milestone: "${params.title}" (${params.type}) on ${params.date}\n\n${JSON.stringify(data, null, 2)}` }] }
  }
)

server.tool(
  'milestone_update',
  'Update a milestone. Change title, date, type, or mark as completed.',
  {
    id: z.string().uuid().describe('Milestone ID'),
    title: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    type: z.enum(['deadline', 'office_hour', 'announcement', 'checkpoint', 'other']).optional(),
    completed: z.boolean().optional().describe('Mark as completed'),
    notes: z.string().optional(),
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
  'Delete a milestone by ID.',
  { id: z.string().uuid().describe('Milestone ID') },
  async ({ id }) => {
    const client = getSupabase()
    const { data, error } = await client.from('milestones').delete().eq('id', id).select().single()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text' as const, text: `Deleted milestone: "${data.title}" (${id})` }] }
  }
)

// --- Proposal Tools ---

server.tool(
  'proposal_get',
  'Get the proposal draft for an opportunity. Returns content, status, and submission links.',
  { opportunity_id: z.string().uuid().describe('Opportunity ID') },
  async ({ opportunity_id }) => {
    const client = getSupabase()
    const { data, error } = await client.from('proposals').select('*').eq('opportunity_id', opportunity_id).maybeSingle()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    if (!data) return { content: [{ type: 'text' as const, text: `No proposal found for opportunity ${opportunity_id}` }] }
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'proposal_update',
  'Create or update a proposal for an opportunity. Supports markdown content, status tracking (draft/submitted/accepted/rejected), and submission links.',
  {
    opportunity_id: z.string().uuid().describe('Opportunity ID'),
    content: z.string().optional().describe('Markdown proposal text'),
    status: z.enum(['draft', 'submitted', 'accepted', 'rejected']).optional(),
    submission_url: z.string().optional().describe('URL where proposal was submitted'),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional().describe('Related links (Google Doc, Notion, GitHub)'),
  },
  async ({ opportunity_id, ...input }) => {
    const client = getSupabase()
    const { data, error } = await client.from('proposals').upsert({ ...input, opportunity_id }, { onConflict: 'opportunity_id' }).select().single()
    if (error) return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true }
    return { content: [{ type: 'text' as const, text: `Proposal ${data.status}: ${opportunity_id}\n\n${JSON.stringify(data, null, 2)}` }] }
  }
)

// --- Resources ---

server.resource(
  'types',
  'opportunity://meta/types',
  { description: 'Valid opportunity type enum values (hackathon, grant, fellowship, bounty)', mimeType: 'application/json' },
  async () => ({
    contents: [{ uri: 'opportunity://meta/types', text: JSON.stringify(opportunityTypes, null, 2), mimeType: 'application/json' }]
  })
)

server.resource(
  'statuses',
  'opportunity://meta/statuses',
  { description: 'Valid opportunity status enum values', mimeType: 'application/json' },
  async () => ({
    contents: [{ uri: 'opportunity://meta/statuses', text: JSON.stringify(opportunityStatuses, null, 2), mimeType: 'application/json' }]
  })
)

server.resource(
  'blockchains',
  'opportunity://meta/blockchains',
  { description: 'Distinct blockchains currently in the database', mimeType: 'application/json' },
  async () => {
    const client = getSupabase()
    const { data: rows } = await client.from('opportunities').select('blockchains')
    const uniqueChains = new Set<string>()
    for (const row of rows ?? []) {
      for (const chain of (row.blockchains as string[]) ?? []) {
        uniqueChains.add(chain)
      }
    }
    return {
      contents: [{ uri: 'opportunity://meta/blockchains', text: JSON.stringify([...uniqueChains].sort(), null, 2), mimeType: 'application/json' }]
    }
  }
)

server.resource(
  'tags',
  'opportunity://meta/tags',
  { description: 'Distinct tags currently in the database', mimeType: 'application/json' },
  async () => {
    const client = getSupabase()
    const { data: rows } = await client.from('opportunities').select('tags')
    const uniqueTags = new Set<string>()
    for (const row of rows ?? []) {
      for (const tag of (row.tags as string[]) ?? []) {
        uniqueTags.add(tag)
      }
    }
    return {
      contents: [{ uri: 'opportunity://meta/tags', text: JSON.stringify([...uniqueTags].sort(), null, 2), mimeType: 'application/json' }]
    }
  }
)

// --- Start ---

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Crypto Opportunities MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
