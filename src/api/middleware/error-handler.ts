import type { Context } from 'hono'
import { ZodError } from 'zod/v4'

export function formatError(code: string, message: string, details?: unknown[]) {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  }
}

export function handleError(err: unknown, c: Context) {
  if (err instanceof ZodError) {
    return c.json(
      formatError(
        'VALIDATION_ERROR',
        'Invalid input',
        err.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }))
      ),
      400
    )
  }

  // Supabase errors have a code and message
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    'message' in err
  ) {
    console.error('Database error:', err)
    return c.json(formatError('DATABASE_ERROR', 'Database error'), 500)
  }

  console.error('Unexpected error:', err)
  return c.json(formatError('INTERNAL_ERROR', 'Internal server error'), 500)
}
