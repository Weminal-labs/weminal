// Edge runtime required by @cloudflare/next-on-pages. Auth chain is now on
// @neondatabase/serverless + Web Crypto, edge-compatible.
export const runtime = 'edge'

import { createMcpServer, isWriteTool } from '@/mcp/http-server'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { validateApiKey } from '@/api/lib/api-key'

async function checkAuth(
  request: Request,
  toolName?: string
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  if (!toolName || !isWriteTool(toolName)) return { ok: true }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, error: 'Authorization: Bearer <key> required for write operations' }
  }

  const raw = authHeader.slice(7)
  const key = await validateApiKey(raw)

  if (!key) {
    return { ok: false, error: 'Invalid or revoked API key' }
  }

  return { ok: true, userId: key.userId }
}

async function getMcpClient() {
  const server = createMcpServer()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  const client = new Client({ name: 'http-proxy', version: '1.0.0' })
  await client.connect(clientTransport)
  return client
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method, params, id } = body

    const client = await getMcpClient()

    // Route JSON-RPC methods
    if (method === 'initialize') {
      await client.getServerVersion()
      return Response.json({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {}, resources: {} }, serverInfo: { name: 'crypto-opportunities', version: '1.0.0' } } })
    }

    if (method === 'tools/list') {
      const result = await client.listTools()
      return Response.json({ jsonrpc: '2.0', id, result })
    }

    if (method === 'resources/list') {
      const result = await client.listResources()
      return Response.json({ jsonrpc: '2.0', id, result })
    }

    if (method === 'resources/read') {
      const result = await client.readResource({ uri: params.uri })
      return Response.json({ jsonrpc: '2.0', id, result })
    }

    if (method === 'tools/call') {
      const auth = await checkAuth(request, params.name)
      if (!auth.ok) {
        return Response.json({
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: `Auth error: ${auth.error}` }], isError: true },
        }, { status: 403 })
      }
      const result = await client.callTool({ name: params.name, arguments: params.arguments ?? {} })
      return Response.json({ jsonrpc: '2.0', id, result })
    }

    if (method === 'notifications/initialized') {
      return Response.json({ jsonrpc: '2.0', id: null, result: null })
    }

    return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } }, { status: 400 })
  } catch (error) {
    console.error('MCP error:', error)
    return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Internal error' } }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({
    name: 'crypto-opportunities',
    version: '1.0.0',
    description: 'Crypto Opportunities Database — MCP Server over HTTP',
    endpoint: '/api/mcp',
    auth: {
      read: 'Public — no auth required for list/get tools',
      write: 'Bearer token required for create/update/delete tools',
      header: 'Authorization: Bearer <your-wem_key>',
    },
    tools: {
      public: ['opportunity_list', 'opportunity_get', 'milestone_list', 'proposal_get'],
      authenticated: ['opportunity_create', 'opportunity_update', 'opportunity_delete', 'milestone_create', 'milestone_update', 'milestone_delete', 'proposal_update'],
    },
    setup: {
      claude_desktop: {
        mcpServers: {
          'crypto-opportunities': {
            url: 'https://weminal.vercel.app/api/mcp',
            headers: { Authorization: 'Bearer <YOUR_API_KEY>' },
          },
        },
      },
    },
  })
}
