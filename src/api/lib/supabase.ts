import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  _supabase = createClient(supabaseUrl, supabaseServiceKey)
  return _supabase
}

// Re-export as lazy getter for convenience
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export async function checkDbHealth(): Promise<boolean> {
  try {
    const client = getSupabase()
    const { error } = await client
      .from('opportunities')
      .select('id')
      .limit(1)
    return !error
  } catch {
    return false
  }
}
