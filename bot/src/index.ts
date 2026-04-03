// Side-effect import: loads .env from process.cwd() (i.e., bot/) before other modules read env
import "dotenv/config";

import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { setupBotHandlers } from "./handlers.js";

const bot = new Telegraf(config.telegramToken);
setupBotHandlers(bot);

bot.launch();
console.log("Weminal Hack Bot started (long-polling mode)");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
