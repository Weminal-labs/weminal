# MCP Server Setup

The Crypto Opportunities MCP server lets Claude Code query and manage your opportunity database, calendar blocks, milestones, and proposals via natural language.

## Prerequisites

- Node.js 18+
- pnpm
- Supabase project with both migrations applied

## Setup

1. Clone the repo and install dependencies:
```bash
pnpm install
```

2. Add to Claude Code via CLI:
```bash
claude mcp add crypto-opportunities npx tsx src/mcp/server.ts \
  --cwd /path/to/crypto-opportunities-db \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

Or add to `.claude/mcp.json`:
```json
{
  "mcpServers": {
    "crypto-opportunities": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/path/to/crypto-opportunities-db",
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key-here"
      }
    }
  }
}
```

## Available Tools (16)

### Opportunities (5)

| Tool | Description | Required Params |
|------|-------------|-----------------|
| opportunity_list | List/filter opportunities by type, status, org, chain, tag, search | none |
| opportunity_get | Get full details by UUID | id |
| opportunity_create | Create new opportunity | name, type |
| opportunity_update | Partial update | id |
| opportunity_delete | Delete by ID | id |

### Calendar Blocks (4)

| Tool | Description | Required Params |
|------|-------------|-----------------|
| block_list | List scheduled work sessions by date range | none |
| block_create | Schedule a work session (link to opportunity or custom) | title, date |
| block_update | Change date, slot, hours, notes, status | id |
| block_delete | Remove a block | id |

### Milestones (4)

| Tool | Description | Required Params |
|------|-------------|-----------------|
| milestone_list | List deadlines, office hours, announcements | none |
| milestone_create | Add a milestone to an opportunity | opportunity_id, title, date, type |
| milestone_update | Change details or mark completed | id |
| milestone_delete | Remove a milestone | id |

### Proposals (2)

| Tool | Description | Required Params |
|------|-------------|-----------------|
| proposal_get | Get proposal draft for an opportunity | opportunity_id |
| proposal_update | Create/update proposal with markdown + status | opportunity_id |

### Resources (4)

| URI | Description |
|-----|-------------|
| opportunity://meta/types | hackathon, grant, fellowship, bounty |
| opportunity://meta/statuses | All 9 status values |
| opportunity://meta/blockchains | Distinct chains in DB |
| opportunity://meta/tags | Distinct tags in DB |

## Example Usage

Once configured, you can ask Claude:

**Opportunities:**
- "List all hackathons"
- "Create a bounty for Sui VM bug hunting"
- "Update the Liquify hackathon status to applying"

**Calendar:**
- "What's on my calendar this week?"
- "Schedule 4 hours on Friday AM for the ETHGlobal hackathon"
- "Mark today's block as done"

**Milestones:**
- "What deadlines are coming up in April?"
- "Add a submission deadline for May 6 to ETHGlobal Open Agents"
- "Mark the registration deadline as completed"

**Proposals:**
- "Show me the proposal for Gitcoin GG21"
- "Write a proposal draft for the Liquify hackathon about building a wallet analysis tool"
- "Update proposal status to submitted"

## Building for Distribution

```bash
pnpm mcp:build
# Output: dist/mcp-server.mjs
```
