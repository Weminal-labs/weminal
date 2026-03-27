type OpportunityRow = {
  id: string
  name: string
  type: string
  description?: string | null
  status: string
  organization?: string | null
  website_url?: string | null
  start_date?: string | null
  end_date?: string | null
  reward_amount?: number | null
  reward_currency?: string
  reward_token?: string | null
  blockchains?: string[]
  tags?: string[]
  links?: { label: string; url: string }[]
  notes?: string | null
  format?: string
  location?: string | null
  parent_hackathon_id?: string | null
  parent_hackathon_name?: string | null
  created_at: string
  updated_at: string
}

type ListResult = {
  data: Record<string, unknown>[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export function formatListResponse(result: ListResult, typeFilter?: string): string {
  const { data, pagination } = result
  const typeLabel = typeFilter ? `${typeFilter}s` : 'opportunities'

  const lines: string[] = [
    `Found ${pagination.total} ${typeLabel} (page ${pagination.page}/${pagination.total_pages})`,
    '',
  ]

  for (const raw of data) {
    const item = raw as OpportunityRow
    const reward = item.reward_amount
      ? `${item.reward_currency ?? 'USD'} ${Number(item.reward_amount).toLocaleString()}${item.reward_token ? ` (${item.reward_token})` : ''}`
      : 'N/A'

    const desc = item.description
      ? item.description.length > 200
        ? item.description.slice(0, 200) + '...'
        : item.description
      : ''

    lines.push(`- **${item.name}** [${item.type}] — ${item.status}`)
    lines.push(`  ID: ${item.id}`)
    if (item.organization) lines.push(`  Org: ${item.organization}`)
    lines.push(`  Reward: ${reward}`)
    if (item.blockchains && item.blockchains.length > 0) {
      lines.push(`  Chains: ${item.blockchains.join(', ')}`)
    }
    if (item.start_date || item.end_date) {
      lines.push(`  Dates: ${item.start_date ?? '?'} → ${item.end_date ?? '?'}`)
    }
    if (desc) lines.push(`  ${desc}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatSingleResponse(item: Record<string, unknown>): string {
  return JSON.stringify(item, null, 2)
}

export function truncateResponse(text: string, maxSize: number): string {
  if (text.length <= maxSize) return text
  return (
    text.slice(0, maxSize - 100) +
    '\n\n--- Response truncated (exceeded ' +
    Math.round(maxSize / 1024) +
    'KB limit) ---'
  )
}
