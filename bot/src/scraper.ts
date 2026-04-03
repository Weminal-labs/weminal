import FirecrawlApp, { type FirecrawlDocument } from "@mendable/firecrawl-js";
import { config } from "./config.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

// ─── Firecrawl scraping ───────────────────────────────────────────────────────

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const firecrawl = new FirecrawlApp({ apiKey: config.firecrawlKey });
  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!result.success) {
      return { url, title: "", content: "", success: false, error: "Scrape failed" };
    }

    const title = result.metadata?.title || extractTitleFromUrl(url);
    const content = (result.markdown || "").slice(0, 8000);

    return { url, title, content, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { url, title: "", content: "", success: false, error: msg };
  }
}

export async function scrapeMultiple(urls: string[]): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  for (const url of urls) {
    results.push(await scrapeUrl(url));
    if (urls.length > 1) await delay(200);
  }
  return results;
}

// ─── Firecrawl search (for deadline discovery) ────────────────────────────────

/**
 * Searches the web via Firecrawl and returns scraped page content.
 * Uses Firecrawl credits (much better content quality than a plain search API).
 */
export async function searchAndScrape(query: string, limit = 3): Promise<ScrapeResult[]> {
  const firecrawl = new FirecrawlApp({ apiKey: config.firecrawlKey });
  try {
    const result = await firecrawl.search(query, {
      limit,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    } as Parameters<typeof firecrawl.search>[1]);

    if (!result.success || !Array.isArray(result.data)) return [];

    return (result.data as FirecrawlDocument[])
      .filter((r) => Boolean(r.markdown))
      .map((r) => ({
        url: r.url || "",
        title: r.metadata?.title || extractTitleFromUrl(r.url || ""),
        content: (r.markdown || "").slice(0, 5000),
        success: true as const,
      }));
  } catch (err) {
    console.error("Firecrawl search error:", err);
    return [];
  }
}

/**
 * Searches for deadline/timeline info for a given opportunity using Firecrawl search.
 * Runs 2 targeted queries and returns formatted context for Gemini.
 */
export async function searchDeadlineInfo(
  opportunityName: string,
  organization: string
): Promise<string> {
  const queries = [
    `${opportunityName} deadline submission date 2025 2026`,
    `${opportunityName} ${organization} registration deadline timeline`,
  ];

  const allResults: ScrapeResult[] = [];
  for (const q of queries) {
    const results = await searchAndScrape(q, 3);
    allResults.push(...results);
    await delay(200);
  }

  if (allResults.length === 0) return "";

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return unique
    .map((r) => `### ${r.title}\nSource: ${r.url}\n${r.content}`)
    .join("\n\n---\n\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
