import type { ColumnType, Generated } from 'kysely'

type JSONColumn = ColumnType<unknown, unknown, unknown>

export type OpportunityType = 'hackathon' | 'grant' | 'fellowship' | 'bounty' | 'bootcamp'

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

export type BlockStatus = 'planned' | 'in_progress' | 'done' | 'skipped'
export type MilestoneType = 'deadline' | 'office_hour' | 'announcement' | 'checkpoint' | 'other'
export type ProposalStatus = 'draft' | 'submitted' | 'accepted' | 'rejected'

type Timestamp = ColumnType<string, string | Date | undefined, string | Date | undefined>
type DateCol = ColumnType<string, string | Date, string | Date>

export interface OpportunitiesTable {
  id: Generated<string>
  name: string
  type: OpportunityType
  description: string | null
  status: Generated<OpportunityStatus>
  organization: string | null
  website_url: string | null
  start_date: ColumnType<string | null, string | Date | null | undefined, string | Date | null | undefined>
  end_date: ColumnType<string | null, string | Date | null | undefined, string | Date | null | undefined>
  reward_amount: ColumnType<string | null, number | string | null | undefined, number | string | null | undefined>
  reward_currency: Generated<string | null>
  reward_token: string | null
  blockchains: Generated<string[]>
  tags: Generated<string[]>
  links: JSONColumn
  notes: string | null
  format: Generated<string | null>
  location: string | null
  parent_hackathon_id: string | null
  created_by: string | null
  created_at: Timestamp
  updated_at: Timestamp
  fts: ColumnType<unknown, never, never>
}

export interface CalendarBlocksTable {
  id: Generated<string>
  opportunity_id: string | null
  title: string
  date: DateCol
  slot: Generated<string>
  hours: ColumnType<string | null, number | string | null | undefined, number | string | null | undefined>
  notes: string | null
  status: Generated<BlockStatus>
  created_at: Timestamp
  updated_at: Timestamp
}

export interface MilestonesTable {
  id: Generated<string>
  opportunity_id: string
  title: string
  date: DateCol
  time: string | null
  type: Generated<MilestoneType>
  links: JSONColumn
  notes: string | null
  completed: Generated<boolean>
  created_by: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ProposalsTable {
  id: Generated<string>
  opportunity_id: string
  content: string | null
  status: Generated<ProposalStatus>
  submission_url: string | null
  links: JSONColumn
  created_by: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface WeeklySnapshotsTable {
  id: Generated<string>
  week_start: DateCol
  week_end: DateCol
  snapshot: JSONColumn
  created_at: Timestamp
  updated_at: Timestamp
}

export interface IdeasTable {
  id: Generated<string>
  slug: string
  title: string
  tagline: string
  category: Generated<string>
  track: Generated<string>
  difficulty: Generated<string>
  tags: Generated<string[]>
  key_points: Generated<string[]>
  problem: string | null
  market_signal: JSONColumn
  community_signal: JSONColumn
  build_guide: JSONColumn
  supported_chains: Generated<string[]>
  chain_overrides: JSONColumn
  source_type: string | null
  source_url: string | null
  source_author: string | null
  source_note: string | null
  is_featured: Generated<boolean>
  votes: Generated<number>
  created_by: string | null
  created_at: Timestamp
  updated_at: Timestamp
  fts: ColumnType<unknown, never, never>
}

export interface UsersTable {
  id: string
  name: string
  email: string
  email_verified: Generated<boolean>
  image: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface SessionsTable {
  id: string
  expires_at: Timestamp
  token: string
  created_at: Timestamp
  updated_at: Timestamp
  ip_address: string | null
  user_agent: string | null
  user_id: string
}

export interface AccountsTable {
  id: string
  account_id: string
  provider_id: string
  user_id: string
  access_token: string | null
  refresh_token: string | null
  id_token: string | null
  access_token_expires_at: Timestamp | null
  refresh_token_expires_at: Timestamp | null
  scope: string | null
  password: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface VerificationsTable {
  id: string
  identifier: string
  value: string
  expires_at: Timestamp
  created_at: Timestamp | null
  updated_at: Timestamp | null
}

export interface UserRolesTable {
  id: Generated<string>
  user_id: string
  role: string
  granted_by: string | null
  created_at: Timestamp
}

export interface UserProfilesTable {
  id: Generated<string>
  user_id: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ApiKeysTable {
  id: Generated<string>
  user_id: string
  label: string
  key_hash: string
  key_prefix: string
  last_used_at: Timestamp | null
  revoked_at: Timestamp | null
  created_at: Timestamp
}

export interface Database {
  opportunities: OpportunitiesTable
  calendar_blocks: CalendarBlocksTable
  milestones: MilestonesTable
  proposals: ProposalsTable
  weekly_snapshots: WeeklySnapshotsTable
  ideas: IdeasTable
  users: UsersTable
  sessions: SessionsTable
  accounts: AccountsTable
  verifications: VerificationsTable
  user_roles: UserRolesTable
  user_profiles: UserProfilesTable
  api_keys: ApiKeysTable
}
