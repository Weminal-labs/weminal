import { sql, type SqlBool } from 'kysely'
import { db } from './db'
import type {
  ListQueryInput,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../schemas/opportunity'

const OPP_COLS = [
  'opportunities.id',
  'opportunities.name',
  'opportunities.type',
  'opportunities.description',
  'opportunities.status',
  'opportunities.organization',
  'opportunities.website_url',
  'opportunities.start_date',
  'opportunities.end_date',
  'opportunities.reward_amount',
  'opportunities.reward_currency',
  'opportunities.reward_token',
  'opportunities.blockchains',
  'opportunities.tags',
  'opportunities.links',
  'opportunities.notes',
  'opportunities.format',
  'opportunities.location',
  'opportunities.parent_hackathon_id',
  'opportunities.created_by',
  'opportunities.created_at',
  'opportunities.updated_at',
] as const

type OppRow = Record<string, unknown> & {
  parent_hackathon_name?: string | null
  creator_id?: string | null
  creator_name?: string | null
  creator_image?: string | null
}

function shape(row: OppRow): Record<string, unknown> {
  const {
    parent_hackathon_name,
    creator_id,
    creator_name,
    creator_image,
    ...rest
  } = row
  return {
    ...rest,
    parent_hackathon_name: parent_hackathon_name ?? null,
    creator: creator_id
      ? { id: creator_id, name: creator_name ?? 'Unknown', image: creator_image ?? null }
      : null,
  }
}

export async function queryOpportunities(params: ListQueryInput) {
  const {
    type,
    status,
    organization,
    blockchain,
    tag,
    search,
    format,
    start_date_gte,
    end_date_lte,
    parent_hackathon_id,
    sort_by,
    sort_order,
    page,
    per_page,
  } = params

  let base = db
    .selectFrom('opportunities')
    .leftJoin('opportunities as parent', 'parent.id', 'opportunities.parent_hackathon_id')
    .leftJoin('users as creator', 'creator.id', 'opportunities.created_by')

  if (type) base = base.where('opportunities.type', '=', type)
  if (status) base = base.where('opportunities.status', '=', status)
  if (organization) base = base.where('opportunities.organization', '=', organization)
  if (blockchain) base = base.where(sql<SqlBool>`opportunities.blockchains @> ARRAY[${sql.lit(blockchain)}]::text[]`)
  if (tag) base = base.where(sql<SqlBool>`opportunities.tags @> ARRAY[${sql.lit(tag)}]::text[]`)
  if (start_date_gte) base = base.where('opportunities.start_date', '>=', start_date_gte)
  if (end_date_lte) base = base.where('opportunities.end_date', '<=', end_date_lte)
  if (format) base = base.where('opportunities.format', '=', format)
  if (parent_hackathon_id) base = base.where('opportunities.parent_hackathon_id', '=', parent_hackathon_id)
  if (search) base = base.where(sql<SqlBool>`opportunities.fts @@ websearch_to_tsquery('english', ${search})`)

  const countResult = await base
    .select(db.fn.countAll<string>().as('count'))
    .executeTakeFirstOrThrow()
  const total = Number(countResult.count)

  const from = (page - 1) * per_page
  const rows = await base
    .select([
      ...OPP_COLS,
      'parent.name as parent_hackathon_name',
      'creator.id as creator_id',
      'creator.name as creator_name',
      'creator.image as creator_image',
    ])
    .orderBy(`opportunities.${sort_by}`, sort_order === 'asc' ? 'asc' : 'desc')
    .limit(per_page)
    .offset(from)
    .execute()

  const data = rows.map((r) => shape(r as OppRow))

  return {
    data,
    pagination: {
      page,
      per_page,
      total,
      total_pages: Math.ceil(total / per_page),
    },
  }
}

export async function getOpportunity(id: string) {
  const row = await db
    .selectFrom('opportunities')
    .leftJoin('opportunities as parent', 'parent.id', 'opportunities.parent_hackathon_id')
    .leftJoin('users as creator', 'creator.id', 'opportunities.created_by')
    .select([
      ...OPP_COLS,
      'parent.name as parent_hackathon_name',
      'creator.id as creator_id',
      'creator.name as creator_name',
      'creator.image as creator_image',
    ])
    .where('opportunities.id', '=', id)
    .executeTakeFirst()

  if (!row) return null
  return shape(row as OppRow)
}

export async function createOpportunity(input: CreateOpportunityInput) {
  return await db
    .insertInto('opportunities')
    .values(input as never)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateOpportunity(
  id: string,
  input: UpdateOpportunityInput
) {
  const row = await db
    .updateTable('opportunities')
    .set(input as never)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
  return row ?? null
}

export async function deleteOpportunity(id: string) {
  const row = await db
    .deleteFrom('opportunities')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
  return row ?? null
}
