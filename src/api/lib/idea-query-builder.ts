import { sql, type SqlBool } from 'kysely'
import { db } from './db'
import type { CreateIdeaInput, UpdateIdeaInput, ListIdeasQuery } from '../schemas/idea'

export async function queryIdeas(params: ListIdeasQuery) {
  const { category, track, difficulty, tag, chain, search, featured, sort_by, sort_order, page, per_page } = params

  let base = db.selectFrom('ideas')

  if (category) base = base.where('category', '=', category)
  if (track) base = base.where('track', '=', track)
  if (difficulty) base = base.where('difficulty', '=', difficulty)
  if (tag) base = base.where(sql<SqlBool>`tags @> ARRAY[${sql.lit(tag)}]::text[]`)
  if (chain) base = base.where(sql<SqlBool>`supported_chains @> ARRAY[${sql.lit(chain)}]::text[]`)
  if (featured !== undefined) base = base.where('is_featured', '=', featured)
  if (search) base = base.where(sql<SqlBool>`fts @@ websearch_to_tsquery('english', ${search})`)

  const countResult = await base
    .select(db.fn.countAll<string>().as('count'))
    .executeTakeFirstOrThrow()
  const total = Number(countResult.count)

  const from = (page - 1) * per_page
  const rows = await base
    .selectAll()
    .orderBy(sort_by, sort_order === 'asc' ? 'asc' : 'desc')
    .limit(per_page)
    .offset(from)
    .execute()

  return {
    data: rows,
    pagination: {
      page,
      per_page,
      total,
      total_pages: Math.ceil(total / per_page),
    },
  }
}

export async function getIdea(slug: string) {
  const row = await db
    .selectFrom('ideas')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst()
  return row ?? null
}

export async function createIdea(input: CreateIdeaInput) {
  return await db
    .insertInto('ideas')
    .values(input as never)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateIdea(slug: string, input: UpdateIdeaInput) {
  const row = await db
    .updateTable('ideas')
    .set(input as never)
    .where('slug', '=', slug)
    .returningAll()
    .executeTakeFirst()
  return row ?? null
}

export async function voteIdea(slug: string) {
  await sql`SELECT increment_idea_votes(${slug})`.execute(db)
  return await getIdea(slug)
}

export async function getIdeaTags(): Promise<string[]> {
  try {
    const rows = await db.selectFrom('ideas').select('tags').execute()
    const unique = new Set<string>()
    for (const row of rows) {
      for (const tag of (row.tags as string[]) ?? []) unique.add(tag)
    }
    return [...unique].sort()
  } catch {
    return []
  }
}

export async function getIdeaChains(): Promise<string[]> {
  try {
    const rows = await db.selectFrom('ideas').select('supported_chains').execute()
    const unique = new Set<string>()
    for (const row of rows) {
      for (const chain of (row.supported_chains as string[]) ?? []) unique.add(chain)
    }
    return [...unique].sort()
  } catch {
    return []
  }
}
