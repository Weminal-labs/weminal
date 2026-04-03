// For local dev: reads from process.env (populated by dotenv in index.ts)
// For CF Workers: call setConfig() with env bindings before first request

let _cfg: Record<string, string> | null = null;

export function setConfig(c: {
  telegramToken: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  firecrawlKey: string;
  geminiKey: string;
}): void {
  _cfg = {
    TELEGRAM_BOT_TOKEN: c.telegramToken,
    SUPABASE_URL: c.supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: c.supabaseServiceKey,
    FIRECRAWL_API_KEY: c.firecrawlKey,
    GEMINI_API_KEY: c.geminiKey,
  };
}

function required(key: string): string {
  const val = _cfg?.[key] ?? (typeof process !== "undefined" ? process.env[key] : undefined);
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

export const config = {
  get telegramToken(): string { return required("TELEGRAM_BOT_TOKEN"); },
  get supabaseUrl(): string { return required("SUPABASE_URL"); },
  get supabaseServiceKey(): string { return required("SUPABASE_SERVICE_ROLE_KEY"); },
  get firecrawlKey(): string { return required("FIRECRAWL_API_KEY"); },
  get geminiKey(): string { return required("GEMINI_API_KEY"); },
};
