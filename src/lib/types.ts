export type OpportunityType = 'hackathon' | 'grant' | 'fellowship' | 'bounty' | 'bootcamp'

export type OpportunityFormat = 'in_person' | 'online' | 'hybrid'

export type OpportunityStatus =
  | 'discovered'
  | 'evaluating'
  | 'applying'
  | 'accepted'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type OpportunityLink = {
  label: string
  url: string
}

export type Opportunity = {
  id: string
  name: string
  type: OpportunityType
  description: string | null
  status: OpportunityStatus
  organization: string | null
  website_url: string | null
  start_date: string | null
  end_date: string | null
  reward_amount: number | null
  reward_currency: string
  reward_token: string | null
  blockchains: string[]
  tags: string[]
  links: OpportunityLink[]
  notes: string | null
  format: string
  location: string | null
  thumbnail_url: string | null
  parent_hackathon_id: string | null
  parent_hackathon_name: string | null
  creator: { id: string; name: string; image: string | null } | null
  created_at: string
  updated_at: string
}

export type WeeklySnapshot = {
  id: string
  week_start: string
  week_end: string
  snapshot: {
    weekStart: string
    weekEnd: string
    newHacks: Opportunity[]
    bestGrant: Opportunity | null
    topHacks: Opportunity[]
    upcomingDeadlines: Opportunity[]
    completedDeadlines: Opportunity[]
    missingDeadlines: Opportunity[]
    insights: {
      topChains: { name: string; count: number }[]
      topTags: { name: string; count: number }[]
      resourceLinks: { name: string; url: string | null; type: string }[]
    }
    stats: {
      totalNew: number
      totalOpportunities: number
      totalReward: number
      byType: { type: string; count: number; totalReward: number }[]
      activityPerDay: { date: string; created: number; updated: number }[]
      funnel: { label: string; value: number }[]
    }
  }
  created_at: string
}

export type PaginationMeta = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type ApiResponse<T> = {
  data: T
  pagination?: PaginationMeta
}

// ─── Ideas Pool ───────────────────────────────────────────────────────────────

export type IdeaSignalItem = {
  type: string
  text: string
}

export type IdeaSignal = {
  verdict?: string
  reasoning?: string
  signals?: IdeaSignalItem[]
}

export type BuildStep = {
  order: number
  title: string
  description: string
}

export type BuildGuide = {
  overview?: string
  steps?: BuildStep[]
  stack_suggestion?: string
  time_estimate?: string
  hackathon_fit?: string
}

export type ChainOverride = {
  note?: string
  stack_override?: string | null
}

export type Idea = {
  id: string
  slug: string
  title: string
  tagline: string
  category: string
  track: string
  difficulty: string
  tags: string[]
  key_points: string[]
  problem: string | null
  market_signal: IdeaSignal
  community_signal: IdeaSignal
  build_guide: BuildGuide
  supported_chains: string[]
  chain_overrides: Record<string, ChainOverride>
  source_type: string | null
  source_url: string | null
  source_author: string | null
  source_note: string | null
  is_featured: boolean
  votes: number
  created_at: string
  updated_at: string
}

export type IdeaTrack = 'defi' | 'dev-tools' | 'infrastructure' | 'ai' | 'gaming' | 'refi' | 'consumer'
export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}
