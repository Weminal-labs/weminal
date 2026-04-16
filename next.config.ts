import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // For Cloudflare Pages (edge runtime) we must prefer the edge-safe variants
  // of conditionally-exported packages — otherwise @better-auth/utils/password
  // resolves via its "node" condition and imports node:crypto, which the edge
  // runtime can't resolve at build time.
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.resolve ??= {}
      // "worker" + "import" picks the edge-compatible password.mjs over password.node.mjs
      config.resolve.conditionNames = ['worker', 'browser', 'import', 'default']
    }
    return config
  },

  // Turbopack equivalent — Next 16 uses Turbopack by default; these conditions
  // apply when the build runs under Turbopack (e.g. `next build`).
  turbopack: {
    resolveExtensions: ['.mjs', '.js', '.ts', '.tsx', '.jsx', '.json'],
    resolveAlias: {
      // Force the edge-safe password implementation regardless of runtime.
      // The edge variant uses Web Crypto (crypto.subtle) instead of node:crypto.
      '@better-auth/utils/password': '@better-auth/utils/dist/password.mjs',
    },
  },
}

export default withNextIntl(nextConfig)
