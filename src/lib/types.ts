export type OpportunityType = 'hackathon' | 'grant' | 'fellowship' | 'bounty'

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
  created_at: string
  updated_at: string
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
