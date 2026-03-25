'use client'

import { useState } from 'react'
import { Check, Copy, Cpu } from 'lucide-react'

const SNIPPET = `claude mcp add crypto-opportunities --transport http https://weminal.vercel.app/api/mcp`

export function McpSnippet() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <Cpu className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
      <span className="text-xs text-gray-500 shrink-0 hidden sm:inline">Use with Claude:</span>
      <code className="flex-1 truncate font-mono text-xs text-gray-700 min-w-0">{SNIPPET}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy MCP snippet'}
        className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
