"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTrendingPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("status", "active")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("acknowledge_count", { ascending: false })
    .limit(20);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getMostChallengedPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("status", "active")
    .gt("challenge_count", 0)
    .order("challenge_count", { ascending: false })
    .limit(20);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getTopAcknowledgedPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(nickname, avatar_emoji)")
    .eq("status", "active")
    .gt("acknowledge_count", 0)
    .order("acknowledge_count", { ascending: false })
    .limit(20);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}
