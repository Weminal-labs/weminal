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

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}
