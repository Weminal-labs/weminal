/**
 * Better Auth server instance
 *
 * Uses postgres.js (edge-compatible) via kysely-postgres-js dialect.
 * This avoids the node pg Pool which requires persistent TCP connections
 * incompatible with Cloudflare Workers.
 *
 * DATABASE_URL must point to the Supabase Transaction pooler (port 6543)
 * with ?pgbouncer=true appended.
 */
import { betterAuth } from 'better-auth'
import { dash } from '@better-auth/infra'
import { Kysely } from 'kysely'
import { PostgresJSDialect } from 'kysely-postgres-js'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
  // Disable prepared statements — required for pgBouncer transaction mode
  prepare: false,
})

const db = new Kysely<Record<string, unknown>>({
  dialect: new PostgresJSDialect({ postgres: sql }),
})

export const auth = betterAuth({
  // Pass the Kysely instance directly — better-auth detects it via { db, type }
  database: {
    db,
    type: 'postgres' as const,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  // Map Better Auth's default camelCase model to our plural snake_case schema
  // (defined in supabase/migrations/20260408_auth_tables.sql)
  user: {
    modelName: 'users',
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    modelName: 'sessions',
    fields: {
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  account: {
    modelName: 'accounts',
    fields: {
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'verifications',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  plugins: [
    dash(),
  ],
})
