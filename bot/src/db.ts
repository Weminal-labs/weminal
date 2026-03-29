import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

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

export async function saveOpportunity(item: Opportunity) {
  const { data, error } = await supabase
    .from("opportunities")
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return data;
}

export async function checkDuplicate(name: string, websiteUrl: string): Promise<boolean> {
  // Check by name similarity
  const { data: byName } = await supabase
    .from("opportunities")
    .select("id")
    .ilike("name", `%${name}%`)
    .limit(1);

  if (byName && byName.length > 0) return true;

  // Check by exact URL match
  const { data: byUrl } = await supabase
    .from("opportunities")
    .select("id")
    .eq("website_url", websiteUrl)
    .limit(1);

  return (byUrl && byUrl.length > 0) || false;
}

export async function getRecentOpportunities(limit = 10) {
  const { data, error } = await supabase
    .from("opportunities")
    .select("name,type,status,organization,reward_amount,start_date,end_date")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data;
}
