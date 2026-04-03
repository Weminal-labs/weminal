import { Telegraf } from "telegraf";
import { setConfig } from "./config.js";
import { setupBotHandlers } from "./handlers.js";
import {
  getAllActiveChatIds,
  getOpportunitiesInWindow,
  markStaleCompleted,
  getTrackedChatIdsForOpportunity,
  hasBeenNotified,
  logNotification,
  NotificationType,
  Opportunity,
} from "./db.js";

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FIRECRAWL_API_KEY: string;
  GEMINI_API_KEY: string;
  BOT_SECRET: string;
}

// Module-level singleton — persists across requests in the same Worker instance
let bot: Telegraf | null = null;

function getBot(env: Env): Telegraf {
  if (!bot) {
    setConfig({
      telegramToken: env.TELEGRAM_BOT_TOKEN,
      supabaseUrl: env.SUPABASE_URL,
      supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
      firecrawlKey: env.FIRECRAWL_API_KEY,
      geminiKey: env.GEMINI_API_KEY,
    });
    bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    setupBotHandlers(bot);
  }
  return bot;
}

// ─── Notification helpers ─────────────────────────────────────────────────────

function buildMessage(opp: Opportunity, type: NotificationType): string {
  const reward = opp.reward_amount ? ` | $${opp.reward_amount.toLocaleString()}` : "";
  const chains = opp.blockchains?.length ? `\nChains: ${opp.blockchains.join(", ")}` : "";
  const url = opp.website_url ? `\n${opp.website_url}` : "";

  if (type === "deadline_7d") {
    return (
      `Deadline in 7 days: ${opp.name}\n` +
      `${opp.type.toUpperCase()} | ${opp.organization}${reward}\n` +
      `Ends: ${opp.end_date}${chains}${url}`
    );
  }
  if (type === "deadline_3d") {
    return (
      `Deadline in 3 days: ${opp.name}\n` +
      `${opp.type.toUpperCase()} | ${opp.organization}${reward}\n` +
      `Ends: ${opp.end_date}${chains}${url}`
    );
  }
  // deadline_1d
  return (
    `DEADLINE TOMORROW: ${opp.name}\n` +
    `${opp.type.toUpperCase()} | ${opp.organization}${reward}\n` +
    `Ends: ${opp.end_date}${chains}${url}`
  );
}

async function sendNotifications(
  telegram: Telegraf["telegram"],
  opportunities: Opportunity[],
  type: NotificationType,
  allChatIds: number[]
): Promise<void> {
  for (const opp of opportunities) {
    if (!opp.id) continue;

    // Everyone in allChatIds gets this + anyone who specifically tracked this opp
    const trackedChatIds = await getTrackedChatIdsForOpportunity(opp.id);
    const recipients = [...new Set([...allChatIds, ...trackedChatIds])];

    const message = buildMessage(opp, type);

    for (const chatId of recipients) {
      if (await hasBeenNotified(chatId, opp.id, type)) continue;

      try {
        await telegram.sendMessage(chatId, message);
        await logNotification(chatId, opp.id, type);
      } catch (err) {
        // Chat may have blocked the bot — log and move on
        console.error(`Failed to notify ${chatId} about "${opp.name}" (${type}):`, err);
      }
    }
  }
}

// ─── Fetch handler (webhook) ──────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "GET") {
      const url = new URL(request.url);
      // Debug endpoint: GET /test-cron?secret=BOT_SECRET — triggers scheduled handler
      if (url.pathname === "/test-cron") {
        const secret = url.searchParams.get("secret");
        if (secret !== env.BOT_SECRET) return new Response("Unauthorized", { status: 401 });
        await this.scheduled({} as ScheduledEvent, env, {} as ExecutionContext);
        return new Response("Cron triggered — check your Telegram!");
      }
      return new Response("Weminal Hack Bot is running on Cloudflare Workers!");
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (env.BOT_SECRET && secret !== env.BOT_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const b = getBot(env);
      const update = await request.json();
      await b.handleUpdate(update as Parameters<typeof b.handleUpdate>[0]);
    } catch (err) {
      console.error("Worker fetch error:", err);
    }

    return new Response("OK");
  },

  // ─── Scheduled handler (cron: 0 9 * * *) ──────────────────────────────────

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log("Cron started:", new Date().toISOString());

    const b = getBot(env);
    const telegram = b.telegram;

    // All chats that have ever used the bot get notified about every deadline
    const allChatIds = await getAllActiveChatIds();
    console.log(`Notifying ${allChatIds.length} active chats`);

    // ── 7-day window ──────────────────────────────────────────────────────────
    const in7d = await getOpportunitiesInWindow(7, 7);
    console.log(`7d window: ${in7d.length} opportunities`);
    await sendNotifications(telegram, in7d, "deadline_7d", allChatIds);

    // ── 3-day window ──────────────────────────────────────────────────────────
    const in3d = await getOpportunitiesInWindow(3, 3);
    console.log(`3d window: ${in3d.length} opportunities`);
    await sendNotifications(telegram, in3d, "deadline_3d", allChatIds);

    // ── 24-hour window ────────────────────────────────────────────────────────
    const in1d = await getOpportunitiesInWindow(1, 1);
    console.log(`1d window: ${in1d.length} opportunities`);
    await sendNotifications(telegram, in1d, "deadline_1d", allChatIds);

    // ── Auto-complete stale ───────────────────────────────────────────────────
    const staleCount = await markStaleCompleted();
    if (staleCount > 0) {
      console.log(`Auto-completed ${staleCount} stale opportunities`);
    }

    console.log("Cron finished:", new Date().toISOString());
  },
};
