import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { config } from "./config.js";
import { ScrapeResult } from "./scraper.js";
import { Opportunity } from "./db.js";

interface GeminiOpportunityResponse {
  name?: string;
  type?: Opportunity["type"];
  description?: string;
  organization?: string;
  start_date?: string | null;
  end_date?: string | null;
  reward_amount?: number | null;
  reward_currency?: string;
  reward_token?: string | null;
  blockchains?: string[];
  tags?: string[];
  links?: { url: string; label: string }[];
  notes?: string;
  summary?: string;
}

function getModel() {
  const genAI = new GoogleGenerativeAI(config.geminiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

const EXTRACTION_SCHEMA = `Return a JSON object (no markdown fences) with these exact fields:
{
  "name": "Short name of the opportunity",
  "type": "hackathon" | "grant" | "fellowship" | "bounty" | "bootcamp",
  "description": "2-3 sentence description covering what it is, prize/funding, and key requirements",
  "organization": "Organizing company/foundation",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "reward_amount": number or null (USD equivalent),
  "reward_currency": "USD",
  "reward_token": "token symbol or null",
  "blockchains": ["chain names relevant to this opportunity"],
  "tags": ["relevant", "keywords", "max 8"],
  "links": [{"url": "...", "label": "short label"}],
  "notes": "Important details: deadlines, submission requirements, eligibility, format (virtual/in-person)",
  "summary": "Human-readable summary for Telegram reply (3-5 bullet points)"
}

Rules:
- If type is unclear, default to "hackathon"
- DATE EXTRACTION IS CRITICAL: Scan the ENTIRE content for deadline, submission deadline,
  registration deadline, end date, closing date, application due date, last day to apply.
  Check headers, footers, sidebars, FAQ, and any "Additional web search results" section.
  end_date = final submission deadline (not judging date, not announcement date).
  If only a month is given (e.g. "March 2026") → use the last day of that month (2026-03-31).
  If a quarter (e.g. "Q1 2026") → last day of that quarter (2026-03-31).
  If a year only → null.
  If multiple deadline stages exist (registration, submission, judging), use the submission deadline.
- reward_amount must be a number (no $ sign) or null
- links should include the main URL and any registration/submission links found
- Extract ALL relevant links from the content
- Reply in the same language as the user message for the summary field
- JSON only, no explanation`;

function buildExtractionPrompt(
  userMessage: string,
  scrapedContext: string,
  failedUrls: string,
  searchContext?: string
): string {
  return `You extract structured data about crypto/tech opportunities from web content.

User message: "${userMessage}"

${scrapedContext ? `Scraped content:\n\n${scrapedContext}` : "No content scraped."}
${failedUrls ? `Failed to scrape:\n${failedUrls}` : ""}
${searchContext ? `\nAdditional web search results for deadline info:\n\n${searchContext}` : ""}

${EXTRACTION_SCHEMA}`;
}

function prepareScrapeContext(scrapeResults: ScrapeResult[]): {
  scrapedContext: string;
  failedUrls: string;
  mainUrl: string;
} {
  const scrapedContext = scrapeResults
    .filter((r) => r.success)
    .map((r) => `## ${r.title}\nURL: ${r.url}\n\n${r.content}`)
    .join("\n\n---\n\n");

  const failedUrls = scrapeResults
    .filter((r) => !r.success)
    .map((r) => `- ${r.url}: ${r.error}`)
    .join("\n");

  const mainUrl = scrapeResults.find((r) => r.success)?.url || "";

  return { scrapedContext, failedUrls, mainUrl };
}

function parseOpportunityResponse(
  text: string,
  mainUrl: string
): { opportunity: Opportunity; summary: string } {
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

  let parsed: GeminiOpportunityResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON. Raw output: " + text.slice(0, 200));
  }

  const opportunity: Opportunity = {
    name: String(parsed.name || "Untitled"),
    type: parsed.type || "hackathon",
    description: String(parsed.description || "").slice(0, 2000),
    status: "discovered",
    organization: String(parsed.organization || "Unknown"),
    website_url: mainUrl,
    start_date: parsed.start_date || null,
    end_date: parsed.end_date || null,
    reward_amount: typeof parsed.reward_amount === "number" ? parsed.reward_amount : null,
    reward_currency: String(parsed.reward_currency || "USD"),
    reward_token: parsed.reward_token || null,
    blockchains: Array.isArray(parsed.blockchains) ? parsed.blockchains : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
    links: Array.isArray(parsed.links) ? parsed.links : mainUrl ? [{ url: mainUrl, label: "Website" }] : [],
    notes: String(parsed.notes || "").slice(0, 2000),
  };

  const summary = String(parsed.summary || parsed.description || "Saved.");
  return { opportunity, summary };
}

export async function extractOpportunity(
  scrapeResults: ScrapeResult[],
  userMessage: string,
  searchContext?: string
): Promise<{ opportunity: Opportunity; summary: string }> {
  const model = getModel();
  const { scrapedContext, failedUrls, mainUrl } = prepareScrapeContext(scrapeResults);
  const prompt = buildExtractionPrompt(userMessage, scrapedContext, failedUrls, searchContext);

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  return parseOpportunityResponse(text, mainUrl);
}

export async function extractOpportunityFromImage(
  imageBase64: string,
  mimeType: string,
  caption: string,
  scrapeResults: ScrapeResult[]
): Promise<{ opportunity: Opportunity; summary: string }> {
  const model = getModel();
  const { scrapedContext, failedUrls, mainUrl } = prepareScrapeContext(scrapeResults);
  const prompt = buildExtractionPrompt(
    caption || "Analyze this image for opportunity details",
    scrapedContext,
    failedUrls
  );

  const parts: Part[] = [
    { inlineData: { mimeType, data: imageBase64 } },
    { text: prompt },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
  });
  const text = result.response.text().trim();

  return parseOpportunityResponse(text, mainUrl);
}

export async function analyzeMessage(userMessage: string): Promise<string> {
  const model = getModel();
  const prompt = `You are an assistant for a hackathon team tracking crypto opportunities.

User message: "${userMessage}"

Provide a concise, helpful response. If the user is asking about opportunities, hackathons, or grants, give relevant advice. Always reply in English.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
