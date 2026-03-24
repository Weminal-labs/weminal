# Data Models

> Generated from PRD data model specification.

## Entities

### opportunities

The single table in v1. Covers hackathons, grants, fellowships, and bounties via the `type` enum.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | TEXT | NOT NULL | Opportunity name |
| `type` | opportunity_type | NOT NULL | hackathon, grant, fellowship, bounty |
| `description` | TEXT | nullable | Detailed description |
| `status` | opportunity_status | NOT NULL, DEFAULT 'discovered' | Pipeline status |
| `organization` | TEXT | nullable | Who runs it (ETHGlobal, Gitcoin, Immunefi, etc.) |
| `website_url` | TEXT | nullable | Main website link |
| `start_date` | DATE | nullable | Meaning varies by type (see below) |
| `end_date` | DATE | nullable | Meaning varies by type (see below) |
| `reward_amount` | NUMERIC(15,2) | nullable | Monetary value |
| `reward_currency` | TEXT | DEFAULT 'USD' | Currency code |
| `reward_token` | TEXT | nullable | Token symbol (ETH, SOL, USDC) |
| `blockchains` | TEXT[] | DEFAULT '{}' | Associated blockchains |
| `tags` | TEXT[] | DEFAULT '{}' | Categorization tags |
| `links` | JSONB | DEFAULT '[]' | Array of {label, url} objects |
| `notes` | TEXT | nullable | Internal notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update (auto-trigger) |

### Enum: opportunity_type

```
hackathon | grant | fellowship | bounty
```

### Enum: opportunity_status

```
discovered | evaluating | applying | accepted | in_progress | submitted | completed | rejected | cancelled
```

## Type-Specific Field Semantics

| Field | Hackathon | Grant | Fellowship | Bounty |
|-------|-----------|-------|------------|--------|
| start_date | Event start | Application open | Program start | — |
| end_date | Event end | Application deadline | Program end | Deadline |
| reward_amount | Prize pool | Grant amount | Stipend | Bounty reward |
| organization | Host (ETHGlobal) | Funder (Gitcoin) | Program (a16z CSS) | Platform (Immunefi) |

## JSONB Links Structure

```json
[
  { "label": "Discord", "url": "https://discord.gg/..." },
  { "label": "Twitter", "url": "https://x.com/..." },
  { "label": "GitHub", "url": "https://github.com/..." },
  { "label": "Application", "url": "https://apply.example.com" }
]
```

Typically 2-5 entries per opportunity. Validated at API layer via Zod (not at database level).

## Indexes

| Index | Type | Column(s) | Purpose |
|-------|------|-----------|---------|
| idx_type | B-tree | type | Filter by opportunity type |
| idx_status | B-tree | status | Filter by status |
| idx_organization | B-tree | organization | Filter by organization |
| idx_start_date | B-tree | start_date | Date range queries |
| idx_end_date | B-tree | end_date | Date range queries |
| idx_blockchains | GIN | blockchains | Array containment (@>) |
| idx_tags | GIN | tags | Array containment (@>) |
| idx_links | GIN | links | JSONB lookups |
| idx_fts | GIN | to_tsvector(name + description) | Full-text search |

## Auto-Update Trigger

`updated_at` is automatically set to `now()` on every UPDATE via a `BEFORE UPDATE` trigger.

## Row-Level Security

RLS is enabled with no policies. This means:
- `anon` key has zero access
- `service_role` key bypasses RLS automatically
- All access is server-side through the API

## Relationships

No relationships in v1 — single table design. v2 may add:
- User -> Opportunity (ownership, multi-tenancy)
- Submission -> Opportunity (deliverable tracking)

## Conventions

- UUIDs for primary keys (gen_random_uuid())
- Hard deletes in v1 (soft deletes with `deleted_at` planned for v2)
- `created_at` and `updated_at` timestamps on all records
- Arrays (TEXT[]) for multi-value fields (blockchains, tags)
- JSONB for structured nested data (links)
- Enums for constrained values (type, status)
