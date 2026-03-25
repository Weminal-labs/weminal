'use client'

import { useState } from 'react'
import { Check, Copy, X, Cpu, Terminal, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SNIPPETS = {
  claudeCode: `claude mcp add crypto-opportunities --transport http https://weminal.vercel.app/api/mcp`,
  claudeDesktop: `{
  "mcpServers": {
    "crypto-opportunities": {
      "url": "https://weminal.vercel.app/api/mcp"
    }
  }
}`,
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy'}
      className="shrink-0 rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </button>
  )
}

export function McpUsageDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-gray-500 gap-1.5"
        aria-label="Usage — connect with Claude"
      >
        <Cpu className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline text-xs">Usage</span>
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mcp-dialog-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Cpu className="size-4 text-gray-500" aria-hidden="true" />
                <h2 id="mcp-dialog-title" className="text-sm font-semibold text-gray-900">
                  Use with Claude
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-500">
                Connect this database to Claude so your agent can read and write opportunities without manual entry.
              </p>

              {/* Claude Code */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-gray-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-gray-600">Claude Code</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <code className="flex-1 truncate font-mono text-xs text-gray-700 min-w-0">
                    {SNIPPETS.claudeCode}
                  </code>
                  <CopyButton text={SNIPPETS.claudeCode} />
                </div>
              </div>

              {/* Claude Desktop */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Settings2 className="size-3.5 text-gray-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-gray-600">Claude Desktop — claude_desktop_config.json</span>
                </div>
                <div className="relative rounded-lg border border-gray-200 bg-gray-50">
                  <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs text-gray-700 leading-relaxed no-scrollbar">
                    {SNIPPETS.claudeDesktop}
                  </pre>
                  <div className="absolute right-2 top-2">
                    <CopyButton text={SNIPPETS.claudeDesktop} />
                  </div>
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-400">
                Read operations are public. Write operations require{' '}
                <code className="rounded bg-gray-100 px-1 font-mono">Authorization: Bearer &lt;API_KEY&gt;</code>.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
