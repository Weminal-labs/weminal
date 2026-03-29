import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { scrapeMultiple } from "./scraper.js";
import { extractOpportunity, extractOpportunityFromImage, analyzeMessage } from "./summarizer.js";
import { saveOpportunity, checkDuplicate, getRecentOpportunities } from "./db.js";

const bot = new Telegraf(config.telegramToken);

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/g;

bot.start((ctx) => {
  ctx.reply(
    "Weminal Hack Bot ready.\n\n" +
      "Send me links or photos (hackathons, grants, bounties) and I'll extract structured data and save to the dashboard.\n\n" +
      "Commands:\n" +
      "/recent - Show last 10 opportunities\n" +
      "/help - Show this message"
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Send me:\n" +
      "- One or more URLs → I'll scrape, extract opportunity data, and save\n" +
      "- A photo/screenshot → I'll analyze the image and extract opportunity data\n" +
      "- Photo with caption + URLs → I'll combine image analysis with scraped content\n" +
      "- Plain text → I'll analyze and respond\n\n" +
      "/recent - Show recent opportunities on dashboard"
  );
});

bot.command("recent", async (ctx) => {
  try {
    const items = await getRecentOpportunities(10);

    if (!items || items.length === 0) {
      return ctx.reply("No opportunities saved yet.");
    }

    const list = items
      .map((item: Record<string, unknown>, i: number) => {
        const reward = item.reward_amount ? `$${Number(item.reward_amount).toLocaleString()}` : "—";
        const dates = [item.start_date, item.end_date].filter(Boolean).join(" → ");
        return `${i + 1}. [${String(item.type).toUpperCase()}] ${item.name}\n   ${item.organization} | ${reward} | ${dates || "No dates"}`;
      })
      .join("\n\n");

    ctx.reply(list);
  } catch (err) {
    console.error("Recent command error:", err);
    ctx.reply("Failed to fetch recent opportunities.");
  }
});

async function downloadTelegramPhoto(fileId: string): Promise<{ base64: string; mimeType: string }> {
  const file = await bot.telegram.getFile(fileId);
  const filePath = file.file_path;
  if (!filePath) throw new Error("Telegram returned no file path");

  const url = `https://api.telegram.org/file/bot${config.telegramToken}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download photo: ${res.status}`);

  const buf = await res.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");

  const ext = filePath.split(".").pop()?.toLowerCase() || "jpg";
  const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
  const mimeType = mimeMap[ext] || "image/jpeg";

  return { base64, mimeType };
}

type ChatAction = "typing" | "upload_photo" | "record_video" | "upload_video" | "record_voice" | "upload_voice" | "upload_document" | "choose_sticker" | "find_location" | "record_video_note" | "upload_video_note";

async function saveAndReply(
  ctx: { reply: (text: string) => Promise<unknown>; sendChatAction: (action: ChatAction) => Promise<unknown> },
  opportunity: Awaited<ReturnType<typeof extractOpportunity>>["opportunity"],
  summary: string
) {
  const isDuplicate = await checkDuplicate(opportunity.name, opportunity.website_url);
  if (isDuplicate) {
    await ctx.reply(`"${opportunity.name}" might already exist in the dashboard.\n\nSaving anyway...`);
  }

  const saved = await saveOpportunity(opportunity);

  const header =
    `Saved: ${opportunity.name}\n` +
    `Type: ${opportunity.type} | Org: ${opportunity.organization}\n` +
    `Reward: ${opportunity.reward_amount ? "$" + opportunity.reward_amount.toLocaleString() : "—"}\n` +
    `Dates: ${[opportunity.start_date, opportunity.end_date].filter(Boolean).join(" → ") || "—"}\n` +
    `Chains: ${opportunity.blockchains.join(", ") || "—"}\n\n`;

  const reply = truncate(header + summary, 4000);
  await ctx.reply(reply).catch(() => ctx.reply(header + "Saved successfully."));

  console.log(`Saved opportunity: ${opportunity.name} (${saved.id})`);
}

bot.on("text", async (ctx) => {
  const message = ctx.message.text;
  const urls = message.match(URL_REGEX) || [];

  try {
    if (urls.length > 0) {
      await ctx.sendChatAction("typing");
      await ctx.reply(`Scraping ${urls.length} link${urls.length > 1 ? "s" : ""}...`);

      const scrapeResults = await scrapeMultiple(urls);
      const successCount = scrapeResults.filter((r) => r.success).length;

      if (successCount === 0) {
        return ctx.reply("Failed to scrape all links. Check if the URLs are accessible.");
      }

      await ctx.sendChatAction("typing");
      const { opportunity, summary } = await extractOpportunity(scrapeResults, message);
      await saveAndReply(ctx, opportunity, summary);
    } else {
      await ctx.sendChatAction("typing");
      const response = await analyzeMessage(message);
      const reply = truncate(response, 4000);
      await ctx.reply(reply);
    }
  } catch (err) {
    console.error("Message handler error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    ctx.reply(`Error: ${msg}`);
  }
});

bot.on("photo", async (ctx) => {
  const photos = ctx.message.photo;
  const largest = photos[photos.length - 1];
  const caption = ctx.message.caption || "";

  try {
    await ctx.sendChatAction("typing");
    await ctx.reply("Analyzing image...");

    const { base64, mimeType } = await downloadTelegramPhoto(largest.file_id);

    const urls = caption.match(URL_REGEX) || [];
    const scrapeResults = urls.length > 0 ? await scrapeMultiple(urls) : [];

    await ctx.sendChatAction("typing");
    const { opportunity, summary } = await extractOpportunityFromImage(base64, mimeType, caption, scrapeResults);
    await saveAndReply(ctx, opportunity, summary);
  } catch (err) {
    console.error("Photo handler error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    ctx.reply(`Error analyzing image: ${msg}`);
  }
});

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

bot.launch();
console.log("Weminal Hack Bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
