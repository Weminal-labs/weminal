import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

function getSupabase() {
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Opportunity {
  id?: string;
  name: string;
  type: "hackathon" | "grant" | "fellowship" | "bounty" | "bootcamp";
  description: string;
  status: string;
  organization: string;
  website_url: string;
  start_date: string | null;
  end_date: string | null;
  reward_amount: number | null;
  reward_currency: string;
  reward_token: string | null;
  blockchains: string[];
  tags: string[];
  links: { url: string; label: string }[];
  notes: string;
}

export type NotificationType = "deadline_7d" | "deadline_3d" | "deadline_1d";

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function saveOpportunity(item: Opportunity): Promise<Opportunity & { id: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("opportunities")
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return data;
}

export async function checkDuplicate(name: string, websiteUrl: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data: byName } = await supabase
    .from("opportunities")
    .select("id")
    .ilike("name", `%${name}%`)
    .limit(1);

  if (byName && byName.length > 0) return true;

  const { data: byUrl } = await supabase
    .from("opportunities")
    .select("id")
    .eq("website_url", websiteUrl)
    .limit(1);

  return Boolean(byUrl && byUrl.length > 0);
}

export async function getRecentOpportunities(limit = 10) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("opportunities")
    .select("name,type,status,organization,reward_amount,start_date,end_date")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data;
}

export async function getUpcomingOpportunities(days = 30): Promise<Opportunity[]> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];
  const future = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .neq("status", "completed")
    .gte("end_date", today)
    .lte("end_date", futureStr)
    .order("end_date", { ascending: true });

  if (error) throw new Error(`Upcoming query failed: ${error.message}`);
  return data || [];
}

/**
 * Returns opportunities whose end_date falls within [minDays, maxDays] from today.
 * Used by the cron to find 7d / 3d / 1d windows.
 */
export async function getOpportunitiesInWindow(
  minDays: number,
  maxDays: number
): Promise<Opportunity[]> {
  const supabase = getSupabase();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minDays);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .neq("status", "completed")
    .not("end_date", "is", null)
    .gte("end_date", minDate.toISOString().split("T")[0])
    .lte("end_date", maxDate.toISOString().split("T")[0]);

  if (error) throw new Error(`Window query failed: ${error.message}`);
  return data || [];
}

export async function markStaleCompleted(): Promise<number> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("opportunities")
    .update({ status: "completed" })
    .lt("end_date", today)
    .neq("status", "completed")
    .not("end_date", "is", null)
    .select("id");

  if (error) throw new Error(`Mark stale failed: ${error.message}`);
  return data?.length || 0;
}

// ─── Chats (auto-registered on first message) ─────────────────────────────────

/**
 * Upserts a chat so the cron knows who to notify.
 * Called automatically whenever the bot receives any message.
 */
export async function registerChat(chatId: number, username?: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("chats")
    .upsert({ chat_id: chatId, username: username || null, last_seen: new Date().toISOString() }, {
      onConflict: "chat_id",
    });

  if (error) console.error("Failed to register chat:", error.message);
}

export async function getAllActiveChatIds(): Promise<number[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("chats").select("chat_id");

  if (error) throw new Error(`Query chats failed: ${error.message}`);
  return (data || []).map((r) => r.chat_id as number);
}

// ─── Tracked opportunities (user-specific interest) ───────────────────────────

/**
 * A user can /track an opportunity they personally plan to join.
 * They get all the same 7d/3d/1d reminders but also see it highlighted in /upcoming.
 */
export async function trackOpportunity(chatId: number, opportunityId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tracked_opportunities")
    .upsert({ chat_id: chatId, opportunity_id: opportunityId }, { onConflict: "chat_id,opportunity_id" });

  if (error) throw new Error(`Track failed: ${error.message}`);
}

export async function untrackOpportunity(chatId: number, opportunityId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tracked_opportunities")
    .delete()
    .eq("chat_id", chatId)
    .eq("opportunity_id", opportunityId);

  if (error) throw new Error(`Untrack failed: ${error.message}`);
}

export async function getTrackedOpportunities(chatId: number): Promise<Opportunity[]> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tracked_opportunities")
    .select("opportunity_id, opportunities(*)")
    .eq("chat_id", chatId);

  if (error) throw new Error(`Get tracked failed: ${error.message}`);

  return (data || [])
    .map((r) => r.opportunities as unknown as Opportunity)
    .filter((o) => o && o.status !== "completed" && (!o.end_date || o.end_date >= today))
    .sort((a, b) => (a.end_date || "").localeCompare(b.end_date || ""));
}

export async function getTrackedChatIdsForOpportunity(opportunityId: string): Promise<number[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tracked_opportunities")
    .select("chat_id")
    .eq("opportunity_id", opportunityId);

  if (error) return [];
  return (data || []).map((r) => r.chat_id as number);
}

// ─── Notification log ─────────────────────────────────────────────────────────

export async function hasBeenNotified(
  chatId: number,
  opportunityId: string,
  type: NotificationType
): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("notification_log")
    .select("id")
    .eq("chat_id", chatId)
    .eq("opportunity_id", opportunityId)
    .eq("notification_type", type)
    .limit(1);

  return Boolean(data && data.length > 0);
}

// ─── Ideas Pool ───────────────────────────────────────────────────────────────

export async function saveIdea(input: {
  slug: string;
  title: string;
  tagline: string;
  key_points?: string[];
  tags?: string[];
  source_type?: string;
  source_author?: string;
}): Promise<{ slug: string; title: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      ...input,
      key_points: input.key_points ?? [],
      tags: input.tags ?? [],
      source_type: input.source_type ?? "telegram",
    })
    .select("slug, title")
    .single();

  if (error) throw new Error(`Failed to save idea: ${error.message}`);
  return data;
}

export async function logNotification(
  chatId: number,
  opportunityId: string,
  type: NotificationType
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("notification_log")
    .upsert(
      { chat_id: chatId, opportunity_id: opportunityId, notification_type: type },
      { onConflict: "chat_id,opportunity_id,notification_type" }
    );

  if (error) console.error("Failed to log notification:", error.message);
}
