import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { scrapeMultiple, searchDeadlineInfo } from "./scraper.js";
import { extractOpportunity, extractOpportunityFromImage, analyzeMessage } from "./summarizer.js";
import {
  saveOpportunity,
  checkDuplicate,
  getRecentOpportunities,
  getUpcomingOpportunities,
  registerChat,
  saveIdea,
  Opportunity,
} from "./db.js";

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/g;

type ChatAction =
  | "typing"
  | "upload_photo"
  | "record_video"
  | "upload_video"
  | "record_voice"
  | "upload_voice"
  | "upload_document"
  | "choose_sticker"
  | "find_location"
  | "record_video_note"
  | "upload_video_note";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadTelegramPhoto(
  fileId: string,
  telegram: Telegraf["telegram"]
): Promise<{ base64: string; mimeType: string }> {
  const file = await telegram.getFile(fileId);
  const filePath = file.file_path;
  if (!filePath) throw new Error("Telegram returned no file path");

  const url = `https://api.telegram.org/file/bot${config.telegramToken}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download photo: ${res.status}`);

  const buf = await res.arrayBuffer();
  let base64: string;
  if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(buf).toString("base64");
  } else {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    base64 = btoa(binary);
  }

  const ext = filePath.split(".").pop()?.toLowerCase() || "jpg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return { base64, mimeType: mimeMap[ext] || "image/jpeg" };
}

/** Escape HTML special chars so they don't break Telegram HTML mode */
function h(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function html(
  ctx: { reply: (text: string, extra?: Record<string, unknown>) => Promise<unknown> },
  text: string
) {
  return ctx.reply(text, { parse_mode: "HTML" });
}

async function saveAndReply(
  ctx: { reply: (text: string, extra?: Record<string, unknown>) => Promise<unknown>; sendChatAction: (action: ChatAction) => Promise<unknown> },
  opportunity: Opportunity,
  summary: string
): Promise<string> {
  const isDuplicate = await checkDuplicate(opportunity.name, opportunity.website_url);
  if (isDuplicate) {
    await html(ctx, `⚠️ <b>${h(opportunity.name)}</b> already exists in the database. Skipped.`);
    return "";
  }

  const saved = await saveOpportunity(opportunity);

  const typeIcon: Record<string, string> = {
    hackathon: "🏆", grant: "💰", fellowship: "🎓", bounty: "🎯", bootcamp: "🚀",
  };
  const icon = typeIcon[opportunity.type] || "📌";
  const nameLink = opportunity.website_url
    ? `<a href="${opportunity.website_url}"><b>${h(opportunity.name)}</b></a>`
    : `<b>${h(opportunity.name)}</b>`;
  const reward = opportunity.reward_amount ? `$${opportunity.reward_amount.toLocaleString()}` : "—";
  const dates = [opportunity.start_date, opportunity.end_date].filter(Boolean).join(" → ") || "—";
  const chains = opportunity.blockchains.length ? opportunity.blockchains.join(", ") : "—";

  const text =
    `✅ <b>Saved!</b>\n\n` +
    `${icon} ${nameLink}\n` +
    `🏢 <i>${h(opportunity.organization)}</i> · ${h(opportunity.type.toUpperCase())}\n` +
    `💰 <b>${reward}</b>\n` +
    `📅 ${dates}\n` +
    `⛓ ${h(chains)}\n\n` +
    `${h(summary)}`;

  await html(ctx, truncate(text, 4000)).catch(() => ctx.reply(`✅ Saved: ${opportunity.name}`));

  console.log(`Saved opportunity: ${opportunity.name} (${saved.id})`);
  return saved.id;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format one opportunity as an HTML list item with link, icons, bold */
function formatOpportunityItem(item: Opportunity, index: number): string {
  const days = item.end_date ? daysUntil(item.end_date) : null;
  const urgencyIcon =
    days === null ? "⚪" :
    days <= 1 ? "🔴" :
    days <= 3 ? "🟠" :
    days <= 7 ? "🟡" : "🟢";
  const urgencyText =
    days === null ? "No deadline" :
    days <= 1 ? "<b>TOMORROW</b>" :
    days <= 3 ? `<b>${days}d — URGENT</b>` :
    `${days}d left`;

  const typeIcon: Record<string, string> = {
    hackathon: "🏆", grant: "💰", fellowship: "🎓", bounty: "🎯", bootcamp: "🚀",
  };
  const icon = typeIcon[item.type] || "📌";
  const reward = item.reward_amount ? ` · <b>$${item.reward_amount.toLocaleString()}</b>` : "";
  const nameLink = item.website_url
    ? `<a href="${item.website_url}"><b>${h(item.name)}</b></a>`
    : `<b>${h(item.name)}</b>`;
  const id = item.id ? ` <code>${item.id.slice(0, 8)}</code>` : "";

  return (
    `${index}. ${icon} ${nameLink}${id}\n` +
    `   ${urgencyIcon} ${urgencyText} · <i>${h(item.organization)}</i>${reward}\n` +
    `   📅 ${item.end_date || "—"}`
  );
}

// ─── Bot handlers ─────────────────────────────────────────────────────────────

export function setupBotHandlers(bot: Telegraf): void {

  // Auto-register every chat (private or group) that interacts with the bot
  bot.use(async (ctx, next) => {
    if (ctx.chat) {
      const username = "username" in ctx.chat ? ctx.chat.username : undefined;
      await registerChat(ctx.chat.id, username).catch(() => {});
    }
    return next();
  });

  // In group chats: only respond when the bot is directly mentioned (@botname)
  // In private chats: respond to everything
  bot.use(async (ctx, next) => {
    const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
    if (!isGroup) return next();

    // Allow commands always (they're explicitly addressed)
    if ("message" in ctx && ctx.message && "text" in ctx.message) {
      const text = ctx.message.text || "";
      if (text.startsWith("/")) return next();

      // Check if bot is mentioned
      const botUsername = ctx.botInfo.username;
      const entities = ctx.message.entities || [];
      const mentioned = entities.some(
        (e) =>
          e.type === "mention" &&
          text.substring(e.offset, e.offset + e.length).toLowerCase() ===
            `@${botUsername.toLowerCase()}`
      );
      if (!mentioned) return; // ignore non-mentions in groups
    }

    if ("message" in ctx && ctx.message && "photo" in ctx.message) {
      const caption = "caption" in ctx.message ? (ctx.message.caption || "") : "";
      const botUsername = ctx.botInfo.username;
      const captionEntities = "caption_entities" in ctx.message ? (ctx.message.caption_entities || []) : [];
      const mentioned = captionEntities.some(
        (e) =>
          e.type === "mention" &&
          caption.substring(e.offset, e.offset + e.length).toLowerCase() ===
            `@${botUsername.toLowerCase()}`
      );
      if (!mentioned) return; // ignore photos in groups unless bot is mentioned in caption
      return next();
    }

    return next();
  });

  bot.start(async (ctx) => {
    await html(ctx,
      "🚀 <b>Weminal Hack Bot</b>\n\n" +
      "Send links or photos to save hackathons &amp; grants.\n\n" +
      "/upcoming — 📅 Deadlines in 30 days\n" +
      "/recent — 🕐 Last 10 saved\n" +
      "/help — All commands"
    );

    try {
      const items = await getUpcomingOpportunities(30);
      if (!items || items.length === 0) {
        return html(ctx, "No upcoming deadlines yet. Send a hackathon link to get started.");
      }
      const list = items.slice(0, 10).map((item, i) => formatOpportunityItem(item, i + 1)).join("\n\n");
      await html(ctx, `📅 <b>Upcoming deadlines:</b>\n\n${list}`);
    } catch {
      // silently skip
    }
  });

  bot.help(async (ctx) => {
    await html(ctx,
      "📖 <b>How to use:</b>\n\n" +
      "• Send a <b>URL</b> → scrape &amp; save opportunity\n" +
      "• Send a <b>photo</b> → AI reads the image\n" +
      "• Photo + URL caption → combined analysis\n" +
      "• Plain text → I'll respond\n\n" +
      "🕐 /recent — Last 10 saved\n" +
      "📅 /upcoming — Deadlines in 30 days\n" +
      "💡 /idea — Submit a project idea\n\n" +
      "<i>Reminders fire automatically: 7d → 3d → 24h before deadline</i>"
    );
  });

  bot.command("recent", async (ctx) => {
    try {
      const items = await getRecentOpportunities(10);
      if (!items || items.length === 0) return html(ctx, "No opportunities saved yet.");

      const typeIcon: Record<string, string> = {
        hackathon: "🏆", grant: "💰", fellowship: "🎓", bounty: "🎯", bootcamp: "🚀",
      };
      const list = items
        .map((item: Record<string, unknown>, i: number) => {
          const icon = typeIcon[String(item.type)] || "📌";
          const reward = item.reward_amount ? `<b>$${Number(item.reward_amount).toLocaleString()}</b>` : "—";
          const dates = [item.start_date, item.end_date].filter(Boolean).join(" → ") || "—";
          return `${i + 1}. ${icon} <b>${h(String(item.name))}</b>\n   <i>${h(String(item.organization))}</i> · ${reward} · 📅 ${dates}`;
        })
        .join("\n\n");

      await html(ctx, `🕐 <b>Recently saved:</b>\n\n${list}`);
    } catch (err) {
      console.error("Recent command error:", err);
      ctx.reply("Failed to fetch recent opportunities.");
    }
  });

  bot.command("upcoming", async (ctx) => {
    try {
      const items = await getUpcomingOpportunities(30);
      if (!items || items.length === 0) return html(ctx, "No upcoming deadlines in the next 30 days.");

      const list = items.map((item, i) => formatOpportunityItem(item, i + 1)).join("\n\n");
      await html(ctx, `📅 <b>Upcoming deadlines (30 days):</b>\n\n${list}`);
    } catch (err) {
      console.error("Upcoming command error:", err);
      ctx.reply("Failed to fetch upcoming deadlines.");
    }
  });

  bot.command("idea", async (ctx) => {
    const text = ctx.message.text.replace(/^\/idea\s*/i, "").trim();

    if (!text) {
      return html(ctx,
        "💡 <b>Submit a project idea:</b>\n\n" +
        "<code>/idea Title | key point 1 | key point 2 #tag1 #tag2</code>\n\n" +
        "Segments separated by <b>|</b> become key points.\n" +
        "Hashtags at the end become tags.\n\n" +
        "<i>Ideas are added to the Ideas Pool at weminal.io/ideas</i>"
      );
    }

    try {
      await ctx.sendChatAction("typing");

      // Extract hashtags
      const tagRegex = /#(\w+)/g;
      const tags: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = tagRegex.exec(text)) !== null) {
        tags.push(m[1].toLowerCase());
      }
      const cleanText = text.replace(/#\w+/g, "").trim();

      // Split by pipe
      const segments = cleanText.split("|").map((s) => s.trim()).filter(Boolean);
      if (segments.length === 0) {
        return ctx.reply("Please provide at least a title after /idea.");
      }

      const title = segments[0];
      const keyPoints = segments.slice(1);

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);

      if (!slug) {
        return html(ctx, "⚠️ Could not generate a valid slug from that title. Try a simpler title with letters or numbers.");
      }

      const tagline = keyPoints[0] || title;

      const saved = await saveIdea({
        slug,
        title,
        tagline,
        key_points: keyPoints,
        tags,
        source_type: "telegram",
        source_author: ctx.from?.username
          ? `@${ctx.from.username}`
          : ctx.from?.first_name || "anon",
      });

      await html(ctx,
        `💡 <b>Idea saved!</b>\n\n` +
        `<b>${h(title)}</b>\n` +
        (keyPoints.length > 0 ? keyPoints.map((p, i) => `  ${i + 1}. ${h(p)}`).join("\n") + "\n" : "") +
        (tags.length > 0 ? `🏷 ${tags.join(", ")}\n` : "") +
        `\n<code>${saved.slug}</code>`
      );
    } catch (err) {
      console.error("Idea command error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      // Unique slug conflict
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return html(ctx, `⚠️ An idea with a similar name already exists.`);
      }
      ctx.reply("Sorry, something went wrong saving the idea. Please try again.");
    }
  });

  bot.on("text", async (ctx) => {
    // Strip @botname mention so it doesn't pollute URL extraction or AI prompt
    const botUsername = ctx.botInfo.username;
    const message = ctx.message.text
      .replace(new RegExp(`@${botUsername}`, "gi"), "")
      .trim();
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

        // First pass — extract from scraped content
        const { opportunity, summary } = await extractOpportunity(scrapeResults, message);

        // If no end_date found, use Firecrawl search to hunt for deadline info
        let finalOpportunity = opportunity;
        let finalSummary = summary;

        if (!opportunity.end_date && opportunity.name) {
          await ctx.sendChatAction("typing");
          const searchContext = await searchDeadlineInfo(opportunity.name, opportunity.organization);

          if (searchContext) {
            const enhanced = await extractOpportunity(scrapeResults, message, searchContext);
            finalOpportunity = enhanced.opportunity;
            finalSummary = enhanced.summary;
          }
        }

        await saveAndReply(ctx, finalOpportunity, finalSummary);
      } else {
        await ctx.sendChatAction("typing");
        const response = await analyzeMessage(message);
        await ctx.reply(truncate(response, 4000));
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

      const { base64, mimeType } = await downloadTelegramPhoto(largest.file_id, ctx.telegram);

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
}
