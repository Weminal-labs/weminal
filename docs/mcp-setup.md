# MCP Server Setup

The Crypto Opportunities MCP server lets Claude Code query and manage your opportunity database via natural language.

## Prerequisites

- Node.js 18+
- pnpm
- Supabase project with migration applied

## Setup

1. Clone the repo and install dependencies:
```bash
pnpm install
```

2. Add to your Claude Code config (`.claude/mcp.json` or `claude_desktop_config.json`):

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

## Available Tools

| Tool | Description | Required Params |
|------|-------------|-----------------|
| opportunity_list | List/filter opportunities | none (all optional) |
| opportunity_get | Get by UUID | id |
| opportunity_create | Create new opportunity | name, type |
| opportunity_update | Partial update | id |
| opportunity_delete | Delete by ID | id |

## Available Resources

| URI | Description |
|-----|-------------|
| opportunity://meta/types | hackathon, grant, fellowship, bounty |
| opportunity://meta/statuses | All 9 status values |
| opportunity://meta/blockchains | Distinct chains in DB |
| opportunity://meta/tags | Distinct tags in DB |

## Example Usage

Once configured, you can ask Claude:

- "List all grants in evaluating status"
- "Show me upcoming hackathons on Ethereum"
- "Create a bounty on Immunefi for $5000 USDC"
- "Update this grant's status to applying"
- "What fellowships are available?"
- "Delete opportunity [id]"

## Building for Distribution

```bash
pnpm mcp:build
# Output: dist/mcp-server.mjs
```
