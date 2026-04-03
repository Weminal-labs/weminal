# Feature: Ideas Pool

**Status:** awaiting-db-migration  
**Phase:** v1.5  
**Route:** `/ideas`

## Summary

Curated library of build ideas for hackathons and grants. Each idea has market validation, community demand signals, and a tech stack breakdown. Developers browse the card grid, filter by track/chain/difficulty, expand accordion panels for details, and click "I want to build this."

## Data Model

Table: `ideas` — slug (unique), title, tagline, category, track, difficulty, tags[], key_points[], problem, market_signal (JSONB), community_signal (JSONB), build_guide (JSONB), supported_chains[], chain_overrides (JSONB), source_*, is_featured, votes, timestamps.

## API Routes

- `GET /api/v1/ideas` — list with filters: category, track, difficulty, tag, chain, search, sort, page
- `GET /api/v1/ideas/:slug` — single idea
- `POST /api/v1/ideas` — create
- `PATCH /api/v1/ideas/:slug` — update
- `POST /api/v1/ideas/vote/:slug` — increment votes
- `GET /api/v1/meta/idea-tracks` — distinct tracks
- `GET /api/v1/meta/idea-tags` — distinct tags
- `GET /api/v1/meta/idea-chains` — distinct chains

## Frontend

Dark card grid (3-col desktop / 2-col tablet / 1-col mobile). Each card: track badge, difficulty badge, featured badge, title, tagline, tags, source attribution, 3 accordion panels, vote count, CTA button.

Filter bar: track pills (DeFi=blue, Dev Tools=violet, Infra=orange, AI=emerald, Gaming=pink, ReFi=teal, Consumer=slate), difficulty select, chain select, tag select, sort dropdown, clear button.

## Bot Integration

`/idea Title | key point 1 | key point 2 #tag1 #tag2` — saves minimal idea from Telegram.

## MCP Tools

`idea_list`, `idea_get`, `idea_create`, `idea_fetch_md`

## UAT Status

not-started

## Tasks

| # | Status | Task |
|---|--------|------|
| T121 | `[x]` | SQL migration: ideas table + indexes + RLS + vote RPC |
| T122 | `[x]` | Seed SQL: DEX CLI — Web3 Bloomberg Terminal |
| T123 | `[x]` | Zod schemas for ideas (create, update, list query) |
| T124 | `[x]` | Query builder: queryIdeas, getIdea, createIdea, updateIdea, voteIdea |
| T125 | `[x]` | Hono routes: GET/POST /ideas, GET/PATCH/POST-vote /:slug |
| T126 | `[x]` | Add ideas route to API index + idea meta endpoints to meta.ts |
| T127 | `[x]` | Types (Idea, IdeaSignal, BuildGuide) + API client functions |
| T128 | `[x]` | TanStack Query hooks: useIdeas, useIdea, useVoteIdea, useIdeaMeta |
| T129 | `[x]` | IdeaCard component with 3 accordion panels + chain selector |
| T130 | `[x]` | IdeaFilterBar component (track pills + selects + sort) |
| T131 | `[x]` | Ideas listing page /ideas (search + filters + grid + pagination) |
| T132 | `[x]` | Add Ideas link to nav |
| T133 | `[x]` | Bot /idea command + saveIdea() in db.ts |
| T134 | `[x]` | MCP tools: idea_list, idea_get, idea_create, idea_fetch_md |
